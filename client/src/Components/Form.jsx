import React, { Component } from 'react';
import PropTypes from "prop-types";
import { TextField, PrimaryButton, Spinner, SpinnerSize } from "office-ui-fabric-react";
import axios from "axios";
import update from "immutability-helper";

export class Form extends Component {
  constructor() {
    super();
    this.state = {
      processing: false,
      fields: []
    };

    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
  }

  render() {
    const { template } = this.props;
    return (
      <div>
        {template ?
          <form onSubmit={this.onFormSubmit}>
            <div className="fieldContainer">
              <div><strong>{template.name}</strong></div>
              {template.description &&
                <small>{template.description}</small>}
            </div>

            {template.fields.map((field, index) =>
              <div key={index} className="fieldContainer">
                <TextField placeholder={field} onChange={this.onFieldChange} name={field} />
              </div>
            )}

            <PrimaryButton type="submit" disabled={this.state.processing}>
              {this.state.processing && <Spinner size={SpinnerSize.small} />}
              Generovat dokument
            </PrimaryButton>

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

    //https://github.com/kennethjiang/js-file-download/blob/master/file-download.js
    axios.post(this.props.url, data, { responseType: "blob" }).then(response => {
      console.log(response);
      var blob = new Blob([response.data]);

      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      var fileName = "dokument.docx";
      link.download = fileName;
      link.click();

      this.setState({ processing: false });
    }).catch(error => {
      this.setState({ processing: false });
    })
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
}

Form.propTypes = {
  url: PropTypes.string.isRequired,
  template: PropTypes.object
}