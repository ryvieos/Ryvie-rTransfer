import React, { useState } from "react";
import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import authService from "../../services/auth.service";
import toast from "../../utils/toast.util";

const SignUpForm = () => {
  const config = useConfig();
  const router = useRouter();
  const t = useTranslate();
  const { refreshUser } = useUser();
  const [beamActive, setBeamActive] = useState(false);

  const validationSchema = yup.object().shape({
    email: yup.string().email(t("common.error.invalid-email")).required(),
    username: yup
      .string()
      .min(3, t("common.error.too-short", { length: 3 }))
      .required(t("common.error.field-required")),
    password: yup
      .string()
      .min(8, t("common.error.too-short", { length: 8 }))
      .required(t("common.error.field-required")),
  });

  const form = useForm({
    initialValues: {
      email: "",
      username: "",
      password: "",
    },
    validate: yupResolver(validationSchema),
  });

  const signUp = async (email: string, username: string, password: string) => {
    await authService
      .signUp(email.trim(), username.trim(), password.trim())
      .then(async () => {
        const user = await refreshUser();
        if (user?.isAdmin) {
          router.replace("/admin/intro");
        } else {
          router.replace("/upload");
        }
      })
      .catch(toast.axiosError);
  };

  return (
    <Container size={420} my={40}>
      <Title
        order={1}
        align="center"
        weight={900}
        size="2.1rem"
        style={{
          marginBottom: "0.5rem",
          letterSpacing: "-1px",
          lineHeight: 1.1,
        }}
      >
        <FormattedMessage id="signup.title" />
      </Title>
      {config.get("share.allowRegistration") && (
        <Text
          color="#444"
          size="lg"
          align="center"
          mt={5}
          style={{ fontWeight: 500 }}
        >
          <FormattedMessage id="signup.description" />{" "}
          <Anchor
            component={Link}
            href={"signIn"}
            size="lg"
            style={{ fontWeight: 600 }}
          >
            <FormattedMessage id="signup.button.signin" />
          </Anchor>
        </Text>
      )}
      <div
        style={{
          position: "relative",
          marginTop: 30,
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
              ? "0 0 80px 32px #a992ff77, 0 0 48px 16px #a992ff44"
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
          <form
            onSubmit={form.onSubmit((values) =>
              signUp(values.email, values.username, values.password),
            )}
          >
            <TextInput
              label={t("signup.input.username")}
              placeholder={t("signup.input.username.placeholder")}
              size="md"
              {...form.getInputProps("username")}
            />
            <TextInput
              label={t("signup.input.email")}
              placeholder={t("signup.input.email.placeholder")}
              mt="md"
              size="md"
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label={t("signin.input.password")}
              placeholder={t("signin.input.password.placeholder")}
              mt="md"
              size="md"
              {...form.getInputProps("password")}
            />
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
              <FormattedMessage id="signup.button.submit" />
            </Button>
          </form>
        </Paper>
      </div>
    </Container>
  );
};

export default SignUpForm;
