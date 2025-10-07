import { Button, Center, createStyles, Group, Text, useMantineTheme } from "@mantine/core";
import { Dropzone as MantineDropzone } from "@mantine/dropzone";
import { ForwardedRef, useRef } from "react";
import { TbCloudUpload, TbUpload } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useTranslate from "../../hooks/useTranslate.hook";
import { FileUpload, UploadedItem } from "../../types/File.type";
import { byteToHumanSizeString } from "../../utils/fileSize.util";
import toast from "../../utils/toast.util";

const useStyles = createStyles((theme) => ({
  bubble: {
    position: "absolute",
    background: theme.colorScheme === "dark"
      ? "rgba(60, 50, 120, 0.35)"
      : "rgba(120, 119, 198, 0.22)",
    borderRadius: "50%",
    filter: "blur(0.5px)",
    opacity: 0.7,
    willChange: "transform, opacity",
    transition: "background 0.3s, opacity 0.3s",
     // Eclaircir au hover de la dropzone
    [`.${theme.other?.dropzoneClassName || 'mantine-Dropzone-root'}:hover &`]: {
      background: theme.colorScheme === "dark"
        ? "rgba(120, 119, 198, 0.40)"
        : "rgba(169, 146, 255, 0.27)",
      opacity: 0.82,
    },
  },
  bubbles: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    borderRadius: "50%",
    zIndex: 1,
    overflow: "hidden",
  },

  wrapper: {
    position: "relative",
    marginBottom: 30,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  dropzone: {
    position: "relative",
    width: 380,
    height: 380,
    borderRadius: "50%",
    border: `2px solid #a992ff` ,
    background: theme.colorScheme === "dark"
      ? "radial-gradient(circle at 50% 50%, #232347 60%, #18182f 100%)"
      : "radial-gradient(circle at 50% 50%, #f8f9fa 60%, #dee2e6 100%)",
    boxShadow: "0 0 24px 4px #a992ff33, 0 0 0 20px rgba(169,146,255,0.04)",
    overflow: "visible",
    transition: "box-shadow 0.3s, border-color 0.3s;",
    "&:hover": {
      borderColor: theme.colors.violet[5],
      boxShadow: `0 0 48px 16px #6c5fcf33, 0 0 0 40px rgba(80,60,180,0.06)`
    },
  },
  

  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.gray[3]
        : theme.colors.gray[6],
  },

  control: {
    position: "absolute",
    left: "50%",
    bottom: -32,
    transform: "translateX(-50%)",
    zIndex: 10,
    background: "#fff",
    boxShadow: "0 4px 24px 0 rgba(120,119,198,0.18)",
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    border: "2.5px solid #a992ff",
    color: theme.colors.violet[6],
    transition: "box-shadow 0.2s",
    '&:hover': {
      boxShadow: `0 0 16px ${theme.colors.violet[5]}55` ,
    },
  },

  content: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: theme.white,
    textAlign: "center",
    zIndex: 2,
  },

  '@keyframes float-bubble': {
    '0%': { transform: 'translateY(0) scale(1)', opacity: 0.4 },
    '40%': { opacity: 0.8 },
    '60%': { transform: 'translateY(-80px) scale(1.15)', opacity: 0.9 },
    '100%': { transform: 'translateY(-160px) scale(0.85)', opacity: 0 },
  },
}));

const Dropzone = ({
  title,
  isUploading,
  maxShareSize,
  onFilesChanged,
  onFolderDetection,
}: {
  title?: string;
  isUploading: boolean;
  maxShareSize: number;
  onFilesChanged: (files: FileUpload[]) => void;
  onFolderDetection?: (items: UploadedItem[], folders: Set<string>) => void;
}) => {
  const t = useTranslate();
  const { classes, cx } = useStyles();
  const openRef = useRef<() => void>();
  const theme = useMantineTheme(); // Ajoute cette ligne

  return (
    <div className={classes.wrapper}>
      <MantineDropzone
        onReject={(e) => toast.error(e[0].errors[0].message)}
        disabled={isUploading}
        openRef={openRef as ForwardedRef<() => void>}
        onDrop={(files: FileUpload[]) => {
          const fileSizeSum = files.reduce((n, { size }) => n + size, 0);

          if (fileSizeSum > maxShareSize) {
            toast.error(
              t("upload.dropzone.notify.file-too-big", {
                maxSize: byteToHumanSizeString(maxShareSize),
              }),
            );
          } else {
            files = files.map((newFile) => {
              newFile.uploadingProgress = 0;
              return newFile;
            });
            onFilesChanged(files);

            if (onFolderDetection) {
              const uploadedItems: UploadedItem[] = [];
              const folders = new Set<string>();

              files.forEach((file) => {
                const relativePath =
                  (file as any).webkitRelativePath ||
                  (file as any).path ||
                  "";
                let rootDir: string | null = null;

                if (relativePath) {
                  const pathParts = relativePath.split("/");
                  if (pathParts.length > 1) {
                    rootDir =
                      pathParts[0] === "" && pathParts.length > 2
                        ? pathParts[1]
                        : pathParts[0];
                    if (rootDir) folders.add(rootDir);
                  }
                }
                uploadedItems.push({ file, rootDir });
              });

              onFolderDetection(uploadedItems, folders);
            }
          }
        }}
        className={classes.dropzone}
      >
        {/* Bulles animées */}
        <div className={classes.bubbles}>
          {Array.from({ length: 36 }).map((_, i) => {
            // Génère une position de départ aléatoire dans le cercle (coordonnées polaires)
            const r = 150 * Math.sqrt(Math.random()); // rayon max = 150px (pour 380px de diamètre)
            const theta = Math.random() * 2 * Math.PI;
            const x = 190 + r * Math.cos(theta); // 190 = rayon + padding
            const y = 190 + r * Math.sin(theta);
            const size = 16 + Math.random() * 24;
            const duration = 6 + Math.random() * 5;
            const delay = Math.random() * 4;
            // Animation keyframes dynamiques pour chaque bulle
            const moveX = (Math.random() - 0.5) * 60;
            const moveY = (Math.random() - 0.5) * 60;
            const keyframes = `@keyframes bubble-move-${i} {
              0% { transform: translate(0px, 0px) scale(1); opacity: 0.5; }
              30% { opacity: 0.8; }
              60% { transform: translate(${moveX}px, ${moveY}px) scale(1.15); opacity: 0.9; }
              100% { transform: translate(${moveX * 1.5}px, ${moveY * 1.5}px) scale(0.85); opacity: 0; }
            }`;
            // Injecte les keyframes dans le document (évite les collisions)
            if (typeof window !== 'undefined' && !document.getElementById(`bubble-move-style-${i}`)) {
              const style = document.createElement('style');
              style.id = `bubble-move-style-${i}`;
              style.innerHTML = keyframes;
              document.head.appendChild(style);
            }
            return (
              <span
                key={i}
                className={classes.bubble}
                style={{
                  left: x - size / 2,
                  top: y - size / 2,
                  width: `${size}px`,
                  height: `${size}px`,
                  animation: `bubble-move-${i} ${duration}s infinite cubic-bezier(.4,2,.6,1)`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>

        {/* Contenu central */}
        <div className={classes.content}>
          <Group position="center">
            <TbCloudUpload
              size={48}
              style={{
                color: theme.colorScheme === "dark" ? "#fff" : "#222", // Utilise Mantine theme
              }}
            />
          </Group>
          <Text
            weight={700}
            size="lg"
            mt="md"
            style={{
              color: theme.colorScheme === "dark" ? "#fff" : "#222", // Utilise Mantine theme
            }}
          >
            {title || <FormattedMessage id="upload.dropzone.title" />}
          </Text>
          <Text
            size="md"
            mt="md"
            style={{
              color: theme.colorScheme === "dark" ? "#bbb" : "#444", // Plus foncé selon le thème
            }}
          >
            <FormattedMessage
              id="upload.dropzone.description"
              values={{ maxSize: byteToHumanSizeString(maxShareSize) }}
            />
          </Text>
        </div>
      </MantineDropzone>

      <button
        className={classes.control}
        disabled={isUploading}
        onClick={() => openRef.current && openRef.current()}
        aria-label="upload"
        type="button"
      >
        <TbUpload size={18} />
      </button>
    </div>
  );
};
export default Dropzone;
