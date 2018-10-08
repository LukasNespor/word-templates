import React, { Component } from 'react';
import PropTypes from "prop-types";
import { TextField, PrimaryButton, Spinner, SpinnerSize, Icon, DefaultButton } from "office-ui-fabric-react";
import axios from "axios";
import update from "immutability-helper";
import { ConfirmDialog } from "./ConfirmDialog";

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
            question="Opravdu si přeješ smazat šablonu?"
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
          <div>Vyberte šablonu v levo nebo přidejte novou.</div>
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
      // var blob = new Blob([response.data]);
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(response.data);

      var fileName = this.props.template.blobName;
      fileName = fileName.substring(0, fileName.lastIndexOf("."));
      link.download = `${fileName}_vyplneno.docx`;
      link.click();

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