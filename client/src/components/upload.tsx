import { FunctionComponent, useState } from "react";
import {
  Dialog, DialogType, DialogFooter,
  TextField,
  PrimaryButton, DefaultButton,
  Spinner, SpinnerSize,
  Stack
} from "@fluentui/react";
import { BlobServiceClient, RestError } from "@azure/storage-blob";
import ITemplate from "../interfaces/ITemplate";
import { createTemplate, getToken } from "../services/dataServics";

export interface IUploadProps {
  hidden: boolean;
  onUploaded: (template: ITemplate) => void;
  onDismissed: () => void;
}

const Upload: FunctionComponent<IUploadProps> = ({ hidden, onDismissed, onUploaded }) => {
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [group, setGroup] = useState("");
  const [file, setFile] = useState<File>();

  const getStyles = () => {
    return {
      main: [{
        selectors: {
          // eslint-disable-next-line
          ["@media (min-width: 480px)"]: {
            maxWidth: "600px",
            minWidth: "400px"
          }
        }
      }]
    };
  };

  const onSubmit = async () => {
    if (!file) {
      return;
    }

    setProcessing(true);
    const sas: string = await getToken();
    const blobClient = BlobServiceClient.fromConnectionString(sas);
    const container = blobClient.getContainerClient("templates");
    try {
      await container.uploadBlockBlob(file.name, file, file.size);
      const processed: ITemplate = await createTemplate({
        id: "",
        blobName: file.name,
        name,
        description,
        group
      });

      setProcessing(false);
      onUploaded(processed);
    } catch (error) {
      const err: RestError = error;
      console.error(err);

      if (err.code === "UnauthorizedBlobOverwrite") {
        setErrorMessage("Šablona s tímto názvem souboru již existuje");
      } else {
        setErrorMessage(`Došlo k chybě: ${err.message}`);
      }
      setProcessing(false);
    }
  };

  const onNameChange = (_: any, value: any) => {
    setName(value);
  };

  const onDescriptionChange = (_: any, value: any) => {
    setDescription(value);
  };

  const onGroupChange = (_: any, value: any) => {
    setGroup(value);
  };

  const onFileChange = (e: any) => {
    const files: File[] = e.target.files;
    setFile(files[0]);
    if ((!name || name.length === 0) && files.length > 0) {
      setName(files[0].name.replace(".docx", ""));
    }
  };

  const onDismiss = () => {
    if (processing) {
      return;
    }
    onDismissed();
  };

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: "Přidat šablonu dokumentu",
        showCloseButton: true,
      }}
      styles={getStyles()}
      hidden={hidden}
      modalProps={{ isBlocking: false }}
      onDismiss={onDismiss}
    >
      <Stack tokens={{ childrenGap: 15 }}>
        <input type="file" onChange={onFileChange} accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document" />

        <TextField
          placeholder="Název šablony"
          value={name}
          required={true}
          onChange={onNameChange}
          validateOnFocusOut
        />

        <TextField
          placeholder="Skupina"
          value={group}
          onChange={onGroupChange} />

        <TextField
          placeholder="Krátký popis šablony" multiline={true}
          value={description}
          onChange={onDescriptionChange} />

        {errorMessage && <div className="error">{errorMessage}</div>}
      </Stack>

      <DialogFooter>
        <PrimaryButton disabled={!(name && file) || processing} onClick={onSubmit}>
          {processing && <Spinner size={SpinnerSize.small} />}
            Nahrát šablonu
          </PrimaryButton>
        <DefaultButton disabled={processing} text="Zavřít" onClick={onDismissed} />
      </DialogFooter>
    </Dialog>
  );
};

export default Upload;
