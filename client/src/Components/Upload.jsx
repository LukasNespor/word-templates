import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Dialog, DialogType, DialogFooter, TextField, PrimaryButton, DefaultButton, Spinner, SpinnerSize
} from "office-ui-fabric-react";
import axios from "axios";

export class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
      name: "",
      description: "",
      file: null
    }

    this.onSubmit = this.onSubmit.bind(this)
    this.onNameChange = this.onNameChange.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    this.onFileChange = this.onFileChange.bind(this)
    this.onDismiss = this.onDismiss.bind(this);
  }

  render() {
    const enableUpload = this.state.name && this.state.file;
    return (
      <Dialog
        dialogContentProps={{
          type: DialogType.normal,
          title: "Přidat šablonu dokumentu",
          showCloseButton: true
        }}
        hidden={this.props.hidden}
        modalProps={{ isBlocking: true }}
        onDismiss={this.onDismiss}
      >
        <div className="fieldContainer">
          <TextField
            placeholder="Název šablony"
            value={this.state.name}
            onChange={this.onNameChange} />
        </div>

        <div className="fieldContainer">
          <TextField
            placeholder="Popis" multiline={true}
            value={this.state.description}
            onChange={this.onDescriptionChange} />
        </div>

        <div className="fieldContainer">
          <input type="file" onChange={this.onFileChange} accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
        </div>

        <DialogFooter>
          <PrimaryButton disabled={!enableUpload || this.state.processing} onClick={this.onSubmit}>
            {this.state.processing && <Spinner size={SpinnerSize.small} />}
            Nahrát šablonu
          </PrimaryButton>
          <DefaultButton disabled={this.state.processing} text="Zavřít" onClick={this.props.onDismissed} />
        </DialogFooter>

      </Dialog>
    )
  }

  onSubmit() {
    this.setState({ processing: true });
    const { file } = this.state;

    axios.get(this.props.getTokenUrl).then(sasResponse => {
      /* global AzureStorage */
      const service = AzureStorage.Blob.createBlobServiceWithSas(sasResponse.data.host, sasResponse.data.token);
      const customBlockSize = file.size > 1024 * 1024 * 32 ? 1024 * 1024 * 4 : 1024 * 512;
      service.singleBlobPutThresholdInBytes = customBlockSize;
      service.createBlockBlobFromBrowserFile("templates", file.name, file, { blockSize: customBlockSize }, (error, result) => {
        if (!error) {
          const data = {
            name: this.state.name,
            description: this.state.description,
            blobName: result.name
          };

          axios.post(this.props.processTemplateurl, data).then(processed => {
            this.setState({
              name: "",
              description: "",
              processing: false
            });

            this.props.onUploaded(processed.data);
          }).catch(error => {
            console.error(error);
            this.setState({ processing: false });
          });
        }
      });
    }).catch(error => {
      console.error(error);
      this.setState({ processing: false });
    });
  }

  onNameChange(e) {
    this.setState({ name: e.target.value })
  }

  onDescriptionChange(e) {
    this.setState({ description: e.target.value })
  }

  onFileChange(e) {
    this.setState({ file: e.target.files[0] })
  }

  onDismiss() {
    if (this.state.processing) {
      return;
    }

    this.props.onDismissed();
  }
}

Upload.propTypes = {
  processTemplateurl: PropTypes.string.isRequired,
  getTokenUrl: PropTypes.string.isRequired,
  hidden: PropTypes.bool.isRequired,
  onUploaded: PropTypes.func.isRequired,
  onDismissed: PropTypes.func.isRequired
}