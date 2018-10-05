import React, { Component } from 'react';
import "./App.css";

import { Upload } from "./Components/Upload";
import { AvailableTemplates } from "./Components/AvailableTemplates";
import { Form } from "./Components/Form";

import { PrimaryButton } from "office-ui-fabric-react";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
initializeIcons();

const funcAppUrl = "http://localhost:7071/api";
const code = "";
const getSASUrl = `${funcAppUrl}/GetSAS?${code}`;
const processTemplateUrl = `${funcAppUrl}/ProcessTemplate?${code}`;
const listTemplatesUrl = `${funcAppUrl}/GetTemplates?${code}`;
const generateDocUrl = `${funcAppUrl}/GenerateDocument?${code}`;

class App extends Component {
  constructor() {
    super();
    this.state = {
      dialogHidden: true,
      templates: [],
      selectedTemplate: null
    };

    this.showUpload = this.showUpload.bind(this);
    this.onTemplatesLoaded = this.onTemplatesLoaded.bind(this);
    this.onUploaded = this.onUploaded.bind(this);
    this.onSelected = this.onSelected.bind(this);
    this.onDissmissedUpload = this.onDissmissedUpload.bind(this);
  }

  render() {
    return (
      <div className="container">
        <div className="sidebar">
          <div className="sidebarContainer">

            <PrimaryButton text="Přidat šablonu" onClick={this.showUpload} />
            {!this.state.dialogHidden &&
              <Upload
                url={processTemplateUrl}
                getSASUrl={getSASUrl}
                hidden={this.state.dialogHidden}
                onUploaded={this.onUploaded}
                onDismissed={this.onDissmissedUpload}
              />
            }

            <AvailableTemplates
              url={listTemplatesUrl}
              templates={this.state.templates}
              onLoaded={this.onTemplatesLoaded}
              onSelected={this.onSelected} />
          </div>
        </div>

        <div className="content">
          <Form
            url={generateDocUrl}
            template={this.state.selectedTemplate} />
        </div>
      </div>
    );
  }

  showUpload() {
    this.setState({ dialogHidden: false });
  }

  onTemplatesLoaded(templates) {
    this.setState({ templates: templates });
  }

  onUploaded(template) {
    const { templates } = this.state;
    templates.push(template);

    this.setState({
      dialogHidden: true,
      templates: templates,
      selectedTemplate: template
    });
  }

  onSelected(template) {
    this.setState({ selectedTemplate: template });
  }

  onDissmissedUpload() {
    this.setState({ dialogHidden: true });
  }
}

export default App;
