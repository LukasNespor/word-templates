import React, { Component } from 'react';
import PropTypes from "prop-types";
import { Spinner, SpinnerSize, Icon } from "office-ui-fabric-react";
import axios from "axios";

export class AvailableTemplates extends Component {
  constructor() {
    super();
    this.state = {
      processing: true
    }
  }

  render() {
    return (
      <div className="availableTemplates">
        {this.state.processing ?
          <div className="spinner">
            <Spinner size={SpinnerSize.medium} />
          </div>
          :
          <ul className="templateList">
            {this.props.templates.map(template =>
              <li key={template.name} className="listItem" onClick={this.onSelected.bind(this, template)}>
                <Icon iconName="WordLogo" className="icon" />
                {template.name}
              </li>
            )}
          </ul>
        }
      </div>
    );
  }

  componentDidMount() {
    axios.get(this.props.getTemplatesUrl).then(response => {
      this.props.onLoaded(response.data);
      this.setState({ processing: false });
    }).catch(error => {
      console.error(error);
      this.setState({ processing: false });
    });
  }

  onSelected(template) {
    this.props.onSelected(template);
  }
}

AvailableTemplates.propTypes = {
  getTemplatesUrl: PropTypes.string.isRequired,
  templates: PropTypes.array.isRequired,
  onLoaded: PropTypes.func.isRequired,
  onSelected: PropTypes.func.isRequired
}