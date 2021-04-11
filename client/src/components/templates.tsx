import { FunctionComponent, useCallback, useEffect, useState } from "react";
import {
  Spinner, SpinnerSize,
  Nav, INavLinkGroup
} from "@fluentui/react";
import _ from "lodash";
import ITemplate from "../interfaces/ITemplate";
import { getTemplates } from "../services/dataServics";

export interface ITemplatesProps {
  items: ITemplate[];
  templatesLoaded: (items: ITemplate[]) => void;
  templateSelected: (item: ITemplate) => void;
}

const Templates: FunctionComponent<ITemplatesProps> = ({ items, templatesLoaded, templateSelected }) => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [navLinks, setNavLinks] = useState<INavLinkGroup[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setErrorMessage("");
      try {
        const resp: ITemplate[] = await getTemplates();
        templatesLoaded(resp);
      } catch (error) {
        setErrorMessage("");
      }
      setLoading(false);
    };

    loadData();
  }, [templatesLoaded]);

  const onSelected = useCallback((e: any, template: ITemplate) => {
    e.preventDefault();
    templateSelected(template);
  }, [templateSelected]);

  useEffect(() => {
    const groups = _.groupBy(items, (item: ITemplate) => {
      if (!item.group) {
        return "___";
      }
      return item.group;
    });
    const sorted = _.keys(groups).sort();
    const links: INavLinkGroup[] = [];

    sorted.forEach((groupName: string) => {
      const mainLink: INavLinkGroup = {
        name: groupName === "___" ? "Nezařazené" : groupName,
        collapseByDefault: true,
        links: []
      };

      groups[groupName].forEach((template: ITemplate) => {
        mainLink.links?.push({
          key: template.id,
          name: template.name,
          icon: "WordDocument",
          url: `#${template.blobName}`,
          onClick: (e) => { onSelected(e, template); }
        });
      });

      links.push(mainLink);
    });

    setNavLinks(links);
  }, [items, onSelected]);

  return (
    <div className="availableTemplates">
      {loading ?
        <div className="spinner">
          <Spinner size={SpinnerSize.medium} />
        </div>
        :
        <Nav groups={navLinks} />
      }

      {errorMessage && <small className="error">{errorMessage}</small>}
    </div>
  );
};

export default Templates;
