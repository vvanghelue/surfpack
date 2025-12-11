import { X } from "lucide-react";
import clsx from "clsx";
import React from "react";

const CloseIcon = ({ ...props }) => (
  <X className="surfpack-code-editor-files-tabs-item-close-icon" {...props} />
);

function getFileNameFromPath(path: string) {
  const parts = path.split("/");
  return parts[parts.length - 1];
}

export function FileTabs({
  openedFiles,
  selectedFile,
  onSelectFile,
  onCloseFile,
}: {
  openedFiles: string[];
  selectedFile?: string | null;
  onSelectFile: (file: string) => void;
  onCloseFile: (file: string) => void;
}) {
  function selectFile(e: React.MouseEvent, file: string) {
    // scroll to set element in center of tabsItem only vertically center
    const target = e.currentTarget;
    target.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    onSelectFile(file);
  }

  return (
    <div className="surfpack-code-editor-files-tabs-container">
      <div className="surfpack-code-editor-files-tabs">
        {openedFiles.map((file) => (
          <div
            key={file}
            className={clsx(
              "surfpack-code-editor-files-tabs-item",
              file === selectedFile &&
                "surfpack-code-editor-files-tabs-item--selected"
            )}
            onClick={(e) => selectFile(e, file)}
          >
            {getFileNameFromPath(file)}{" "}
            <CloseIcon
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (openedFiles.length === 1) return;
                onCloseFile(file);
              }}
            />
          </div>
        ))}
      </div>

      {/* <div className="surfpack-code-editor-files-tabs">
        <div className="surfpack-code-editor-files-tabs-item surfpack-code-editor-files-tabs-item--selected">
          dsqdsq <CloseIcon />
        </div>
        <div className="surfpack-code-editor-files-tabs-item">
          dsqdsq <CloseIcon />
        </div>
        <div className="surfpack-code-editor-files-tabs-item">
          dsqdsq <CloseIcon />
        </div>
        <div className="surfpack-code-editor-files-tabs-item">
          dsqdsq <CloseIcon />
        </div>
        <div className="surfpack-code-editor-files-tabs-item">
          dsqdsq <CloseIcon />
        </div>
        <div className="surfpack-code-editor-files-tabs-item">
          dsqdsq <CloseIcon />
        </div>
        <div className="surfpack-code-editor-files-tabs-item">
          dsqdsq <CloseIcon />
        </div>
        <div className="surfpack-code-editor-files-tabs-item">
          dsqdsq <CloseIcon />
        </div>
      </div> */}

      <div className="surfpack-code-editor-files-tabs-fader"></div>
    </div>
  );
}
