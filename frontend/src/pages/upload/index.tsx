import { Button, Group } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { cleanNotifications } from "@mantine/notifications";
import { AxiosError } from "axios";
import pLimit from "p-limit";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import Dropzone from "../../components/upload/Dropzone";
import FileList from "../../components/upload/FileList";
import showCompletedUploadModal from "../../components/upload/modals/showCompletedUploadModal";
import showCreateUploadModal from "../../components/upload/modals/showCreateUploadModal";
import useConfig from "../../hooks/config.hook";
import useConfirmLeave from "../../hooks/confirm-leave.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import shareService from "../../services/share.service";
import { FileUpload, UploadedItem, FolderUploadState } from "../../types/File.type";
import { CreateShare, Share } from "../../types/share.type";
import toast from "../../utils/toast.util";
import { useRouter } from "next/router";

const promiseLimit = pLimit(3);
let errorToastShown = false;
let createdShare: Share;

const Upload = ({
  maxShareSize,
  isReverseShare = false,
  simplified,
}: {
  maxShareSize?: number;
  isReverseShare: boolean;
  simplified: boolean;
}) => {
  const modals = useModals();
  const router = useRouter();
  const t = useTranslate();

  const { user } = useUser();
  const config = useConfig();
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isUploading, setisUploading] = useState(false);

  // State for folder detection
  const [folderState, setFolderState] = useState<FolderUploadState>({
    items: [],
    folders: new Set<string>()
  });

  // Animation state for "Partager" button
  const [explode, setExplode] = useState(false);

  // Animation state for explosion on main page after "Terminer"
  const [showExplosion, setShowExplosion] = useState(false);

  useConfirmLeave({
    message: t("upload.notify.confirm-leave"),
    enabled: isUploading,
  });

  const chunkSize = useRef(parseInt(config.get("share.chunkSize")));

  maxShareSize ??= parseInt(config.get("share.maxSize"));
  const autoOpenCreateUploadModal = config.get("share.autoOpenShareModal");

  const uploadFiles = async (share: CreateShare, files: FileUpload[]) => {
    setisUploading(true);

    try {
      const isReverseShare = router.pathname != "/upload";
      createdShare = await shareService.create(share, isReverseShare);
    } catch (e) {
      toast.axiosError(e);
      setisUploading(false);
      return;
    }

    const fileUploadPromises = files.map(async (file, fileIndex) =>
      // Limit the number of concurrent uploads to 3
      promiseLimit(async () => {
        let fileId;

        const setFileProgress = (progress: number) => {
          setFiles((files) =>
            files.map((file, callbackIndex) => {
              if (fileIndex == callbackIndex) {
                file.uploadingProgress = progress;
              }
              return file;
            }),
          );
        };

        setFileProgress(1);

        let chunks = Math.ceil(file.size / chunkSize.current);

        // If the file is 0 bytes, we still need to upload 1 chunk
        if (chunks == 0) chunks++;

        for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
          const from = chunkIndex * chunkSize.current;
          const to = from + chunkSize.current;
          const blob = file.slice(from, to);
          try {
            await shareService
              .uploadFile(
                createdShare.id,
                blob,
                {
                  id: fileId,
                  name: file.name,
                },
                chunkIndex,
                chunks,
              )
              .then((response) => {
                fileId = response.id;
              });

            setFileProgress(((chunkIndex + 1) / chunks) * 100);
          } catch (e) {
            if (
              e instanceof AxiosError &&
              e.response?.data.error == "unexpected_chunk_index"
            ) {
              // Retry with the expected chunk index
              chunkIndex = e.response!.data!.expectedChunkIndex - 1;
              continue;
            } else {
              setFileProgress(-1);
              // Retry after 5 seconds
              await new Promise((resolve) => setTimeout(resolve, 5000));
              chunkIndex = -1;

              continue;
            }
          }
        }
      }),
    );

    Promise.all(fileUploadPromises);
  };

  // Callback for modal creation
  const showCreateUploadModalCallback = (files: FileUpload[]) => {
    showCreateUploadModal(
      modals,
      {
        isUserSignedIn: user ? true : false,
        isReverseShare,
        allowUnauthenticatedShares: config.get(
          "share.allowUnauthenticatedShares",
        ),
        enableEmailRecepients: config.get("email.enableShareEmailRecipients"),
        maxExpiration: config.get("share.maxExpiration"),
        shareIdLength: config.get("share.shareIdLength"),
        simplified,
      },
      files,
      uploadFiles,
    );
  };

  const handleDropzoneFilesChanged = (files: FileUpload[]) => {
    if (autoOpenCreateUploadModal) {
      setFiles(files);
      showCreateUploadModalCallback(files);
    } else {
      setFiles((oldArr) => [...oldArr, ...files]);
    }
  };

  // Handle folder detection from the Dropzone component
  const handleFolderDetection = (items: UploadedItem[], folders: Set<string>) => {
    setFolderState(prevState => {
      // Create a new Set that includes both previous folders and new ones
      const mergedFolders = new Set<string>(prevState.folders);
      folders.forEach(folder => mergedFolders.add(folder));

      // Merge items, preventing duplicates based on file name
      const existingFileNames = new Set(prevState.items.map(item => item.file.name));
      const newItems = items.filter(item => !existingFileNames.has(item.file.name));

      return {
        items: [...prevState.items, ...newItems],
        folders: mergedFolders
      };
    });
  };

  // Handle folder state updates from FileList
  const handleFoldersUpdated = (items: UploadedItem[], folders: Set<string>) => {
    // When folders are updated from FileList (like during deletion),
    // we use the provided state directly as it already contains the correct data
    setFolderState({
      items,
      folders
    });
  };

  useEffect(() => {
    // Check if there are any files that failed to upload
    const fileErrorCount = files.filter(
      (file) => file.uploadingProgress == -1,
    ).length;

    if (fileErrorCount > 0) {
      if (!errorToastShown) {
        toast.error(
          t("upload.notify.count-failed", { count: fileErrorCount }),
          {
            withCloseButton: false,
            autoClose: false,
          },
        );
      }
      errorToastShown = true;
    } else {
      cleanNotifications();
      errorToastShown = false;
    }

    // Complete share
    if (
      files.length > 0 &&
      files.every((file) => file.uploadingProgress >= 100) &&
      fileErrorCount == 0
    ) {
      shareService
        .completeShare(createdShare.id)
        .then((share) => {
          setisUploading(false);
          showCompletedUploadModal(modals, share, () => {
            setShowExplosion(true);
            setTimeout(() => setShowExplosion(false), 1030); // 1030ms pour pas qu'il y ait de bug de réapparition de l'animation  il faut < 1050ms environ
          });
          setFiles([]);
        })
        .catch(() => toast.error(t("upload.notify.generic-error")));
    }
  }, [files]);

  // Fonction de clic avec animation
  const handleShareClick = () => {
    setExplode(true);
    setTimeout(() => setExplode(false), 700); // durée de l'animation
    showCreateUploadModalCallback(files);
  };

  return (
    <>
      <Meta title={t("upload.title")} />
      <Dropzone
        title={
          !autoOpenCreateUploadModal && files.length > 0
            ? t("share.edit.append-upload")
            : undefined
        }
        maxShareSize={maxShareSize}
        isUploading={isUploading}
        onFilesChanged={handleDropzoneFilesChanged}
        onFolderDetection={handleFolderDetection}
      />
      <style>
        {`
          .explode-anim {
            animation: explodeYoupi 0.7s cubic-bezier(.42,2,.58,.5);
            position: relative;
            z-index: 1;
          }
          @keyframes explodeYoupi {
            0% { box-shadow: 0 2px 12px 0 #7c5fff33; transform: scale(1); }
            30% { box-shadow: 0 0 40px 10px #a992ff88, 0 0 80px 30px #7c5fff44; transform: scale(1.2); }
            60% { box-shadow: 0 0 60px 30px #7c5fff88, 0 0 120px 60px #a992ff44; transform: scale(1.05); }
            100% { box-shadow: 0 2px 12px 0 #7c5fff33; transform: scale(1); }
          }
          .explosion-effect {
            position: fixed;
            top: 50%;
            left: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            z-index: 9999;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: radial-gradient(circle, #a992ff 0%, #7c5fff 60%, transparent 100%);
            animation: explosionAnim 1.2s cubic-bezier(.42,2,.58,.5);
            opacity: 0.8;
          }
          @keyframes explosionAnim {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
            60% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
          }
        `}
      </style>
      {showExplosion && (
        <div className="explosion-effect">
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 32,
              textShadow: "0 2px 12px #7c5fff, 0 0 20px #a992ff",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            Parfait&nbsp;!
          </span>
        </div>
      )}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: 30, marginTop: 10 }}>
        <Button
          loading={isUploading}
          disabled={files.length <= 0}
          onClick={handleShareClick}
          size="lg"
          className={explode ? "explode-anim" : ""}
          sx={theme => ({
            borderRadius: 18,
            padding: "0 2rem",
            fontWeight: 600,
            fontSize: 18,
            background: theme.colorScheme === "dark"
              ? "#7c5fff"
              : "#a992ff",
            color: theme.white,
            boxShadow: "0 2px 12px 0 #7c5fff33",
            border: "none",
            transition: "transform 0.15s, box-shadow 0.15s, background 0.15s",
            '&:hover': {
              transform: 'scale(1.035)',
              boxShadow: "0 4px 20px 0 #a992ff44",
              background: theme.colorScheme === "dark"
                ? "#a992ff"
                : "#7c5fff",
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
          })}
        >
          <FormattedMessage id="common.button.share" />
        </Button>
      </div>
      {files.length > 0 && (
        <FileList 
          files={files} 
          setFiles={setFiles}
          uploadedItems={folderState.items}
          onFoldersUpdated={handleFoldersUpdated} 
        />
      )}
    </>
  );
};
export default Upload;
