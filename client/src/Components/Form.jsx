import React, { Component } from 'react';
import PropTypes from "prop-types";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { PrimaryButton, DefaultButton } from "office-ui-fabric-react/lib/Button";
import { Spinner, SpinnerSize } from "office-ui-fabric-react/lib/Spinner";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import { ConfirmDialog } from "./ConfirmDialog";
import axios from "axios";
import update from "immutability-helper";

export class Form extends Component {
  constructor() {
    super();
    this.state = {
      processing: false,
      confirmIsOpen: false,
      fields: []
    };

    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onRemoveConfirmed = this.onRemoveConfirmed.bind(this);
    this.onRemoveDismissed = this.onRemoveDismissed.bind(this);
  }

  render() {
    const { template } = this.props;
    return (
      <div>
        {this.state.confirmIsOpen &&
          <ConfirmDialog
            question="Opravdu si přejete šablonu smazat?"
            onConfirmed={this.onRemoveConfirmed}
            onDismissed={this.onRemoveDismissed} />}

        {template ?
          <form onSubmit={this.onFormSubmit}>
            <div className="fieldContainer">
              <div>
                <strong>{template.name}</strong>
              </div>

              {template.description &&
                <small>{template.description}</small>}
            </div>

            {template.fields.map((field, index) =>
              <div key={index} className="fieldContainer">
                <TextField placeholder={field} onChange={this.onFieldChange} name={field} />
              </div>
            )}

            <div className="buttons">
              <PrimaryButton type="submit" disabled={this.state.processing}>
                {this.state.processing && <Spinner size={SpinnerSize.small} />}
                Generovat dokument
              </PrimaryButton>

              <DefaultButton onClick={this.onRemove}>
                <Icon iconName="Delete" className="icon" />
                Odstranit šablonu
              </DefaultButton>
            </div>
          </form>
          :
          <div>Vyberte šablonu dokumentu v levo nebo přidejte novou.</div>
        }
      </div>
    );
  }

  onFieldChange(e) {
    this.updateField(e.target.name, e.target.value);
  }

  onFormSubmit(e) {
    e.preventDefault();
    this.setState({ processing: true });
    const data = {
      fields: this.state.fields,
      blobName: this.props.template.blobName
    };

    // https://github.com/kennethjiang/js-file-download/blob/master/file-download.js
    axios.post(this.props.generateDocumentUrl, data, { responseType: "blob" }).then(response => {
      var fileName = this.props.template.blobName;
      fileName = fileName.substring(0, fileName.lastIndexOf("."));
      fileName = `${fileName}_vyplneno.docx`;

      var blob = new Blob([response.data], { type: response.type || 'application/octet-stream' });
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were 
        // revoked by closing the blob for which they were created. 
        // These URLs will no longer resolve as the data backing 
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, fileName);
      }
      else {
        var blobURL = window.URL.createObjectURL(blob);
        var tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = blobURL;
        tempLink.setAttribute('download', fileName);

        // Safari thinks _blank anchor are pop ups. We only want to set _blank
        // target if the browser does not support the HTML5 download attribute.
        // This allows you to download files in desktop safari if pop up blocking 
        // is enabled.
        if (typeof tempLink.download === 'undefined') {
          tempLink.setAttribute('target', '_blank');
        }

        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        window.URL.revokeObjectURL(blobURL);
      }

      this.setState({ processing: false });
    }).catch(error => {
      console.error(error);
      this.setState({ processing: false });
    });
  }

  updateField(fieldName, value) {
    const { fields } = this.state;

    const field = fields.filter(x => {
      return x.name === fieldName;
    });

    if (field.length > 0) {
      const index = fields.indexOf(field[0]);
      const updatedFields = update(fields, { [index]: { value: { $set: value } } });
      this.setState({ fields: updatedFields });
    } else {
      fields.push({ name: fieldName, value: value });
      this.setState({ fields: fields });
    }
  }

  onRemove() {
    this.setState({ confirmIsOpen: true });
  }

  onRemoveConfirmed() {
    axios.post(this.props.removeTemplateUrl, this.props.template).then(_ => {
      this.setState({ confirmIsOpen: false });
      this.props.onRemoved(this.props.template);
    }).catch(error => {
      console.error(error);
    });
  }

  onRemoveDismissed() {
    this.setState({ confirmIsOpen: false });
  }
}

Form.propTypes = {
  generateDocumentUrl: PropTypes.string.isRequired,
  removeTemplateUrl: PropTypes.string.isRequired,
  template: PropTypes.object,
  onRemoved: PropTypes.func.isRequired
}