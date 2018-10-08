import React, { Component } from 'react';
import PropTypes from "prop-types";
import { Spinner, SpinnerSize } from "office-ui-fabric-react/lib/Spinner";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import axios from "axios";

export class AvailableTemplates extends Component {
  constructor() {
    super();
    this.state = {
      processing: true,
      message: ""
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

        {this.state.message && <small className="error">{this.state.message}></small>}
      </div>
    );
  }

  componentDidMount() {
    axios.get(this.props.getTemplatesUrl).then(response => {
      this.props.onLoaded(response.data);
      this.setState({ message: "", processing: false });
    }).catch(error => {
      console.error(error);
      this.setState({
        message: JSON.stringify(error, null, 1),
        processing: false
      });
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