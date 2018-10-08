import React, { Component } from 'react';
import "./App.css";

import { Upload } from "./Components/Upload";
import { AvailableTemplates } from "./Components/AvailableTemplates";
import { Form } from "./Components/Form";
import update from "immutability-helper";

import { PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
initializeIcons();

const funcAppUrl = "http://localhost:7071/api";
const getTokenUrl = `${funcAppUrl}/GetToken`;
const listTemplatesUrl = `${funcAppUrl}/GetTemplates`;
const generateDocUrl = `${funcAppUrl}/GenerateDocument`;
const processTemplateUrl = `${funcAppUrl}/ProcessTemplate`;
const removeTemplateUrl = `${funcAppUrl}/RemoveTemplate`;

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
    this.onTemplateRemoved = this.onTemplateRemoved.bind(this);
  }

  render() {
    return (
      <div className="container">
        <div className="sidebar">
          <div className="sidebarContainer">

            <PrimaryButton text="Přidat šablonu" onClick={this.showUpload} />
            {!this.state.dialogHidden &&
              <Upload
                processTemplateurl={processTemplateUrl}
                getTokenUrl={getTokenUrl}
                hidden={this.state.dialogHidden}
                onUploaded={this.onUploaded}
                onDismissed={this.onDissmissedUpload}
              />
            }

            <AvailableTemplates
              getTemplatesUrl={listTemplatesUrl}
              templates={this.state.templates}
              onLoaded={this.onTemplatesLoaded}
              onSelected={this.onSelected} />
          </div>
        </div>

        <div className="content">
          <Form
            generateDocumentUrl={generateDocUrl}
            removeTemplateUrl={removeTemplateUrl}
            template={this.state.selectedTemplate}
            onRemoved={this.onTemplateRemoved} />
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

  onTemplateRemoved(template) {
    const { templates } = this.state;
    const found = templates.find(x => x.blobName === template.blobName);
    const index = templates.indexOf(found);
    const updated = update(templates, { $splice: [[index, 1]] });

    this.setState({
      templates: updated,
      selectedTemplate: null
    });
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
