import React, { Component } from 'react';
import PropTypes from "prop-types";
import { Spinner, SpinnerSize, Icon } from "office-ui-fabric-react";
// import axios from "axios";

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
    setTimeout(() => {
      this.props.onLoaded([
        { name: "Šablona 1", path: "/templates/template1.dotx", fields: ["FirstName", "LastName", "Today"] },
        {
          name: "Šablona 2", path: "/templates/template2.dotx", fields: ["Field1", "Field2", "Field3"],
          description: "Lorem ipsum dolor sit amet"
        },
        { name: "Šablona 3", path: "/templates/template3.dotx", fields: ["Exekutor", "Dluznik", "Dnes"] }
      ]);
      this.setState({ processing: false });
    }, 500);

    // axios.get(this.props.url).then(response => {
    //   this.setState({ templates: response })
    // });
  }

  onSelected(template) {
    this.props.onSelected(template);
  }
}

AvailableTemplates.propTypes = {
  url: PropTypes.string.isRequired,
  templates: PropTypes.array.isRequired,
  onLoaded: PropTypes.func.isRequired,
  onSelected: PropTypes.func.isRequired
}