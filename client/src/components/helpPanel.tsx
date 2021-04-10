import { FunctionComponent } from "react";
import { Panel, PanelType, DefaultButton } from "@fluentui/react";

export interface IHelpPanelProps {
  onDismissed: () => void;
}

export const HelpPanel: FunctionComponent<IHelpPanelProps> = ({ onDismissed }) => {
  const renderFooter = () => (
    <DefaultButton text="Zavřít" onClick={onDismissed} />
  );

  return (
    <Panel
      type={PanelType.large}
      headerText="Jak vytvořit šablonu dokumentu"
      isFooterAtBottom={true}
      onRenderFooterContent={renderFooter}
      isOpen={true}
      isLightDismiss={true}
      onDismiss={onDismissed}>
      <ol className="helpList">
        <li>
          Na záložce <strong>Vložení</strong> najděte <strong>Rychlé části</strong> a pod tím <strong>Pole</strong>. (Insert &gt; Quick Parts &gt; Field)
            <img src="/images/01-field-add.png" alt="Insert field" width="100%" />
        </li>
        <li>
          Otevře se dialogovné okno, kde je potřeba najít <strong>MergeField</strong> a do pole <strong>Název pole</strong> napsat libovolné pojmenování pole. (MergeField &gt; Field name)
            <img src="/images/02-field-dialog.png" alt="Inser field dialog" width="100%" />
        </li>
        <li>
          Nově přidané pole se zobrazí v místě kurzoru myši.
            <img src="/images/03-field-added.png" alt="Result with field" width="100%" />
        </li>
        <li>Dokument uložte jako <strong>Word Document (*.docx)</strong> a nahrajte do systému.</li>
      </ol>
    </Panel>
  );
};

export default HelpPanel;
