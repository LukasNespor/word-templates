import React, { Component } from 'react';
import PropTypes from "prop-types";
import { TextField, PrimaryButton, Spinner, SpinnerSize } from "office-ui-fabric-react";
// import axios, { post } from "axios";

export class Form extends Component {
  constructor() {
    super();
    this.state = {
      processing: false
    };

    this.onFormSubmit = this.onFormSubmit.bind(this);
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
                <TextField placeholder={field} componentRef={field.name} />
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

  onFormSubmit(e) {
    e.preventDefault();
    this.setState({ processing: true });

    setTimeout(() => {
      this.setState({ processing: false });
    }, 500);
  }
}

Form.propTypes = {
  url: PropTypes.string.isRequired,
  template: PropTypes.object
}