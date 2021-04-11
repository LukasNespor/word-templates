import { FunctionComponent, useState } from "react";
import {
  TextField, Text,
  PrimaryButton, DefaultButton,
  Spinner, SpinnerSize,
  Icon, Dropdown,
  FontSizes,
  Stack, IStackTokens
} from "@fluentui/react";
import { ConfirmDialog } from "./confirmDialog";
import update from "immutability-helper";
import ITemplate from "../interfaces/ITemplate";
import IListItem from "../interfaces/IListItem";
import IField from "../interfaces/IField";
import { deleteTemplate, generateDocument } from "../services/dataServics";

export interface IFormProps {
  template: ITemplate;
  lists: IListItem[];
  onRemoved: (item: ITemplate) => void;
}

const stackTokens: IStackTokens = { maxWidth: 400, childrenGap: 15 };
const buttonTokens: IStackTokens = { childrenGap: 10 };

const Form: FunctionComponent<IFormProps> = ({ template, lists, onRemoved }) => {
  const [processing, setProcessing] = useState(false);
  const [confirmIsOpen, setConfirmIsOpen] = useState(false);
  const [fields, setFields] = useState<IField[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");

  const renderInputField = (field: string) => {
    if (field.toLowerCase().indexOf("seznam") === -1) {
      return (
        <TextField key={field} placeholder={field} onChange={onTextFieldChange} name={field} />
      );
    } else {
      const splitted = field.split(" ");
      const listName = splitted[1].toLowerCase();
      const pad = listName === "exekutor" ? 3 : 2;
      const items = lists
        .filter((x: IListItem) => x.type === listName)
        .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))
        .map((x: IListItem) => ({
          key: `${x.uid}|${field}`,
          text: `${padLeft(x.id, pad)} | ${x.value}`
        }));

      return (
        <Dropdown
          key={field}
          placeholder={field}
          options={[{ key: `-1|${field}`, text: "" }, ...items]}
          onChange={onSelectFieldChange}
        />
      );
    }
  };

  const updateField = (fieldName: string, value: any) => {
    const field = fields.filter((x: IField) => {
      return x.name === fieldName;
    });

    if (field.length > 0) {
      const index = fields.indexOf(field[0]);
      const updatedFields = update(fields, { [index]: { value: { $set: value } } });
      setFields(updatedFields);
    } else {
      setFields([...fields, { name: fieldName, value }]);
    }
  };

  const onTextFieldChange = (e: any) => {
    updateField(e.target.name, e.target.value);
  };

  const onFileNameChange = (e: any) => {
    setFileName(e.target.value);
  };

  const onSelectFieldChange = (_: any, item: any) => {
    const splitted = item.key.split("|");
    const found = lists.find((x: IListItem) => x.uid === splitted[0]);
    if (found) {
      updateField(splitted[1], found.value);
    }
  };

  const onFormSubmit = async (e: any) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const blob: Blob = await generateDocument(fields, template.blobName);
      const name = `${fileName.length > 0 ? fileName : "vyplneno"}.docx`;

      const blobURL = window.URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      tempLink.style.display = "none";
      tempLink.href = blobURL;
      tempLink.setAttribute("download", name);

      // Safari thinks _blank anchor are pop ups. We only want to set _blank
      // target if the browser does not support the HTML5 download attribute.
      // This allows you to download files in desktop safari if pop up blocking
      // is enabled.
      if (typeof tempLink.download === "undefined") {
        tempLink.setAttribute("target", "_blank");
      }

      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobURL);

    } catch (error) {
      console.error(error);
      setErrorMessage("Došlo k chybě");
    }

    setProcessing(false);
  };

  const onRemove = () => {
    setConfirmIsOpen(true);
  };

  const onRemoveConfirmed = async () => {
    try {
      await deleteTemplate(template.id);
      setConfirmIsOpen(false);
      onRemoved(template);
    } catch (error) {
      console.error(error);
    }
  };

  const onRemoveDismissed = () => {
    setConfirmIsOpen(false);
  };

  const padLeft = (text: string, size: number) => {
    while (text.length < (size || 2)) { text = "0" + text; }
    return text;
  };

  return (
    <div>
      {confirmIsOpen &&
        <ConfirmDialog onConfirmed={onRemoveConfirmed} onDismissed={onRemoveDismissed} />
      }

      <form onSubmit={onFormSubmit}>
        <Stack tokens={stackTokens}>
          <Stack.Item>
            <Text style={{ fontSize: FontSizes.large }}>{template.name}</Text>

            {template.description &&
              <div>
                <small>{template.description}</small>
              </div>
            }
          </Stack.Item>

          <TextField placeholder="Název vygenerovaného souboru"
            onChange={onFileNameChange} name="fileName" />

          {template.fields?.map((field: string) =>
            renderInputField(field)
          )}

          <Stack horizontal horizontalAlign="space-between" tokens={stackTokens}>
            <PrimaryButton type="submit" disabled={processing}>
              <Stack horizontal verticalAlign="center" tokens={buttonTokens}>
                {processing ?
                  <Spinner size={SpinnerSize.small} />
                  :
                  <Icon iconName="WordLogoInverse" className="icon" />
                }
                <span>Generovat dokument</span>
              </Stack>
            </PrimaryButton>

            <DefaultButton onClick={onRemove}>
              <Stack horizontal verticalAlign="center" tokens={buttonTokens}>
                <Icon iconName="Delete" className="icon" />
                <span>Odstranit šablonu</span>
              </Stack>
            </DefaultButton>
          </Stack>
        </Stack>
      </form>

      {errorMessage && <small className="error">{errorMessage}</small>}
    </div>
  );
};

export default Form;
