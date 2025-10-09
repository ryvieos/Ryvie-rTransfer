import { Button, Stack, Text } from "@mantine/core";
import { useModals } from "@mantine/modals";
import { ModalsContextProps } from "@mantine/modals/lib/context";
import moment from "moment";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import useTranslate, {
  translateOutsideContext,
} from "../../../hooks/useTranslate.hook";
import { CompletedShare } from "../../../types/share.type";
import CopyTextField from "../CopyTextField";

const showCompletedUploadModal = (
  modals: ModalsContextProps,
  share: CompletedShare,
  onDone?: () => void, // <-- Ajout
) => {
  const t = translateOutsideContext();
  return modals.openModal({
    closeOnClickOutside: false,
    withCloseButton: false,
    closeOnEscape: false,
    title: t("upload.modal.completed.share-ready"),
    children: <Body share={share} onDone={onDone} />, // <-- Ajout
  });
};

const Body = ({ share, onDone }: { share: CompletedShare; onDone?: () => void }) => {
  const modals = useModals();
  const router = useRouter();
  const t = useTranslate();

  const isReverseShare = !!router.query["reverseShareToken"];
  const link = `${window.location.origin}/s/${share.id}`;

  return (
    <Stack align="stretch">
      <CopyTextField link={link} />
      {share.notifyReverseShareCreator === true && (
        <Text
          size="sm"
          sx={(theme) => ({
            color:
              theme.colorScheme === "dark"
                ? theme.colors.gray[3]
                : theme.colors.dark[4],
          })}
        >
          {t("upload.modal.completed.notified-reverse-share-creator")}
        </Text>
      )}
      <Text
        size="xs"
        sx={(theme) => ({
          color: theme.colors.gray[6],
        })}
      >
        {moment(share.expiration).unix() === 0
          ? t("upload.modal.completed.never-expires")
          : t("upload.modal.completed.expires-on", {
              expiration: moment(share.expiration).format("LLL"),
            })}
      </Text>
      <Button
        onClick={() => {
          if (onDone) onDone(); // <-- Ajout
          modals.closeAll();
          if (isReverseShare) {
            router.reload();
          } else {
            router.push("/upload");
          }
        }}
      >
        <FormattedMessage id="common.button.done" />
      </Button>
    </Stack>
  );
};

export default showCompletedUploadModal;
