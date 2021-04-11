import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { initializeIcons } from "@fluentui/react";
import update from "immutability-helper";
import Upload from "./components/upload";
import Templates from "./components/templates";
import Form from "./components/form";
import HelpPanel from "./components/helpPanel";
import Navigation from "./components/navigation";
import ITemplate from "./interfaces/ITemplate";
import IListItem from "./interfaces/IListItem";
import { getLists } from "./services/dataServics";
import "./App.css";

const App: FunctionComponent = () => {
  const [dialogHidden, setDialogHidden] = useState(true);
  const [helpHidden, setHelpHidden] = useState(true);
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [lists, setLists] = useState<IListItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ITemplate>();

  useEffect(() => {
    initializeIcons();
    const loadData = async () => {
      try {
        const resp = await getLists();
        setLists(resp);
      } catch (error) {
        console.error("Nepodařilo se načíst seznamy");
      }
    };

    loadData();
  }, []);

  const showUpload = () => {
    setDialogHidden(false);
  };

  const onUploadDissmissed = () => {
    setDialogHidden(true);
  };

  const showHelpPanel = () => {
    setHelpHidden(false);
  };

  const onHelpPanelDismissed = () => {
    setHelpHidden(true);
  };

  const onTemplatesLoaded = useCallback((items: ITemplate[]) => {
    setTemplates(items);
  }, []);

  const onTemplateRemoved = (template: ITemplate) => {
    const found = templates.find((x: ITemplate) => x.blobName === template.blobName);
    if (found) {
      const index = templates.indexOf(found);
      const updated = update(templates, { $splice: [[index, 1]] });
      setTemplates(updated);
      setSelectedTemplate(undefined);
    }
  };

  const onUploaded = (template: ITemplate) => {
    setDialogHidden(true);
    setTemplates([...templates, template]);
    setSelectedTemplate(template);
  };

  const onSelected = (template: ITemplate) => {
    setSelectedTemplate(template);
  };

  return (
    <>
      <Navigation addTemplate={showUpload} getHelp={showHelpPanel} />
      <div className="container">
        <div className="sidebar">
          <div className="sidebarContainer">

            {!helpHidden &&
              <HelpPanel onDismissed={onHelpPanelDismissed} />
            }

            {!dialogHidden &&
              <Upload
                hidden={dialogHidden}
                onUploaded={onUploaded}
                onDismissed={onUploadDissmissed}
              />
            }

            <Templates
              items={templates}
              templatesLoaded={onTemplatesLoaded}
              templateSelected={onSelected} />
          </div>
        </div>

        <div className="content">
          {selectedTemplate ?
            <Form
              template={selectedTemplate}
              lists={lists}
              onRemoved={onTemplateRemoved} />
            :
            <div>Vyberte šablonu dokumentu vlevo nebo přidejte novou.</div>
          }
        </div>
      </div>
    </>
  );
};

export default App;
