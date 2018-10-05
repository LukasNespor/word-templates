import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Dialog, DialogType, DialogFooter, TextField, PrimaryButton, DefaultButton, Spinner, SpinnerSize
} from "office-ui-fabric-react";
// import axios, { post } from "axios";

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
    this.onChange = this.onChange.bind(this)
    this.fileUpload = this.fileUpload.bind(this)
  }

  render() {
    const enableUpload = this.state.name && this.state.file;
    return (
      <Dialog
        dialogContentProps={{
          type: DialogType.normal,
          title: "Přidat novou šablonu dokumentu",
          showCloseButton: true
        }}
        hidden={this.props.hidden}
        onDismiss={this.props.onDismissed}
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
          <input type="file" onChange={this.onChange} />
        </div>

        <DialogFooter>
          <PrimaryButton disabled={!enableUpload || this.state.processing} onClick={this.onSubmit}>
            {this.state.processing && <Spinner size={SpinnerSize.small} />}
            Nahrát šablonu
          </PrimaryButton>
          <DefaultButton text="Zavřít" onClick={this.props.onDismissed} />
        </DialogFooter>

      </Dialog>
    )
  }

  onSubmit() {
    this.setState({ processing: true });
    this.fileUpload(this.state.file).then(response => {
      this.setState({
        templateName: "",
        processing: false
      });

      this.props.onUploaded(response);
    })
  }

  onNameChange(e) {
    this.setState({ name: e.target.value })
  }

  onDescriptionChange(e) {
    this.setState({ description: e.target.value })
  }

  onChange(e) {
    this.setState({ file: e.target.files[0] })
  }

  fileUpload(file) {
    const formData = new FormData();
    formData.append("file", file)
    const config = {
      headers: {
        "content-type": "multipart/form-data"
      }
    }

    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          name: this.state.name,
          description: this.state.description,
          path: "/templates/some-template.dotx",
          fields: [
            "Field1",
            "Field2",
            "Field3"
          ]
        });
      }, 500)
    });
    // return post(this.props.url, formData, config)
  }
}

Upload.propTypes = {
  url: PropTypes.string.isRequired,
  hidden: PropTypes.bool.isRequired,
  onUploaded: PropTypes.func.isRequired,
  onDismissed: PropTypes.func.isRequired
}