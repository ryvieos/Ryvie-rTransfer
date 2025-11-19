import {
  Anchor,
  Button,
  Container,
  createStyles,
  Group,
  Loader,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TbInfoCircle } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useConfig from "../../hooks/config.hook";
import useUser from "../../hooks/user.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import authService from "../../services/auth.service";
import { getOAuthIcon, getOAuthUrl } from "../../utils/oauth.util";
import { safeRedirectPath } from "../../utils/router.util";
import toast from "../../utils/toast.util";

const useStyles = createStyles((theme) => ({
  signInWith: {
    fontWeight: 500,
    "&:before": {
      content: "''",
      flex: 1,
      display: "block",
    },
    "&:after": {
      content: "''",
      flex: 1,
      display: "block",
    },
  },
  or: {
    "&:before": {
      content: "''",
      flex: 1,
      display: "block",
      borderTopWidth: 1,
      borderTopStyle: "solid",
      borderColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[4],
    },
    "&:after": {
      content: "''",
      flex: 1,
      display: "block",
      borderTopWidth: 1,
      borderTopStyle: "solid",
      borderColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[4],
    },
  },
}));

const SignInForm = ({ redirectPath }: { redirectPath: string }) => {
  const config = useConfig();
  const router = useRouter();
  const t = useTranslate();
  const { refreshUser } = useUser();
  const { classes } = useStyles();

  const [beamActive, setBeamActive] = useState(false);
  const [oauthProviders, setOauthProviders] = useState<string[] | null>(null);
  const [isRedirectingToOauthProvider, setIsRedirectingToOauthProvider] =
    useState(false);

  const validationSchema = yup.object().shape({
    emailOrUsername: yup.string().required(t("common.error.field-required")),
    password: yup.string().required(t("common.error.field-required")),
  });

  const form = useForm({
    initialValues: {
      emailOrUsername: "",
      password: "",
    },
    validate: yupResolver(validationSchema),
  });

  const signIn = async (email: string, password: string) => {
    await authService
      .signIn(email.trim(), password.trim())
      .then(async (response) => {
        if (response.data["loginToken"]) {
          // Prompt the user to enter their totp code
          showNotification({
            icon: <TbInfoCircle />,
            color: "blue",
            radius: "md",
            title: t("signIn.notify.totp-required.title"),
            message: t("signIn.notify.totp-required.description"),
          });
          router.push(
            `/auth/totp/${
              response.data["loginToken"]
            }?redirect=${encodeURIComponent(redirectPath)}`,
          );
        } else {
          await refreshUser();
          router.replace(safeRedirectPath(redirectPath));
        }
      })
      .catch(toast.axiosError);
  };

  useEffect(() => {
    authService
      .getAvailableOAuth()
      .then((providers) => {
        setOauthProviders(providers.data);
        if (
          providers.data.length === 1 &&
          config.get("oauth.disablePassword")
        ) {
          setIsRedirectingToOauthProvider(true);
          router.push(getOAuthUrl(window.location.origin, providers.data[0]));
        }
      })
      .catch(toast.axiosError);
  }, []);

  if (!oauthProviders) return null;

  if (isRedirectingToOauthProvider)
    return (
      <Group align="center" position="center">
        <Loader size="sm" />
        <Text align="center">
          <FormattedMessage id="common.text.redirecting" />
        </Text>
      </Group>
    );

  return (
    <Container size={420} my={40}>
      <Title
        order={2}
        align="center"
        weight={900}
        size="2.1rem"
        style={{
          marginBottom: "0.5rem",
          letterSpacing: "-1px",
          lineHeight: 1.1,
        }}
      >
        <FormattedMessage id="signin.title" />
      </Title>
      {config.get("share.allowRegistration") && (
        <Text
          color="#444"
          size="lg"
          align="center"
          mt={5}
          style={{ fontWeight: 500 }}
        >
          <FormattedMessage id="signin.description" />{" "}
          <Anchor
            component={Link}
            href={"signUp"}
            size="lg"
            style={{ fontWeight: 600 }}
          >
            <FormattedMessage id="signin.button.signup" />
          </Anchor>
        </Text>
      )}
      <div
        style={{
          position: "relative",
          marginTop: 60, // augmenté de 40 -> 60 pour abaisser encore un peu
          display: "flex",
          justifyContent: "center",
        }}
        onMouseEnter={() => setBeamActive(true)}
        onMouseLeave={() => setBeamActive(false)}
      >
        {/* Faisceau lumineux collé à la zone */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            pointerEvents: "none",
            borderRadius: 24,
            boxShadow: beamActive
              ? "0 0 32px 12px #a992ff33, 0 0 20px 8px #a992ff22" // réduit ici
              : "0 0 48px 16px #a992ff55, 0 0 24px 8px #a992ff33",
            transition: "box-shadow 0.25s cubic-bezier(.42,2,.58,.5)",
          }}
        />
        <Paper
          withBorder
          shadow="md"
          p={30}
          radius="md"
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
        >
          {config.get("oauth.disablePassword") || (
            <form
              onSubmit={form.onSubmit((values) => {
                signIn(values.emailOrUsername, values.password);
              })}
            >
              <TextInput
                label={t("signin.input.email-or-username")}
                placeholder={t("signin.input.email-or-username.placeholder")}
                size="md"
                {...form.getInputProps("emailOrUsername")}
              />
              <PasswordInput
                label={t("signin.input.password")}
                placeholder={t("signin.input.password.placeholder")}
                mt="md"
                size="md"
                {...form.getInputProps("password")}
              />
              {config.get("smtp.enabled") && (
                <Group position="right" mt="xs">
                  <Anchor component={Link} href="/auth/resetPassword" size="xs">
                    <FormattedMessage id="resetPassword.title" />
                  </Anchor>
                </Group>
              )}
              <Button
                fullWidth
                mt="xl"
                type="submit"
                size="lg"
                radius="xl"
                style={{
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  letterSpacing: "0.5px",
                }}
              >
                <FormattedMessage id="signin.button.submit" />
              </Button>
            </form>
          )}
          {oauthProviders.length > 0 && (
            <Stack mt={config.get("oauth.disablePassword") ? undefined : "xl"}>
              {config.get("oauth.disablePassword") ? (
                <Group align="center" className={classes.signInWith}>
                  <Text>{t("signIn.oauth.signInWith")}</Text>
                </Group>
              ) : (
                <Group align="center" className={classes.or}>
                  <Text>{t("signIn.oauth.or")}</Text>
                </Group>
              )}
              <Group position="center">
                {oauthProviders.map((provider) => (
                  <Button
                    key={provider}
                    component="a"
                    title={t(`signIn.oauth.${provider}`)}
                    href={getOAuthUrl(window.location.origin, provider)}
                    variant="light"
                    fullWidth
                  >
                    {getOAuthIcon(provider)}
                    {"\u2002" + t(`signIn.oauth.${provider}`)}
                  </Button>
                ))}
              </Group>
            </Stack>
          )}
        </Paper>
      </div>
    </Container>
  );
};

export default SignInForm;
