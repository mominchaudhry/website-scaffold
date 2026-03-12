import React from "react";
import { Box, Field, Flex, Typography } from "@strapi/design-system";
import { HexColorPicker } from "react-colorful";
import styled from "styled-components";

const HEX_VALUE_PATTERN = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const Picker = styled(HexColorPicker)`
  && {
    width: 100%;
    max-width: 20rem;
    aspect-ratio: 1.5;
  }
`;

const Swatch = styled.div`
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background-color: ${(props) => props.$color};
`;

function normalizeHex(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!HEX_VALUE_PATTERN.test(trimmed)) {
    return null;
  }

  const withoutHash = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  return `#${withoutHash.toUpperCase()}`;
}

export const HexColorFieldInput = React.forwardRef(function HexColorFieldInput(
  { hint, disabled = false, labelAction, label, name, required = false, onChange, value, error },
  ref
) {
  const [textValue, setTextValue] = React.useState(typeof value === "string" ? value.toUpperCase() : "");

  React.useEffect(() => {
    setTextValue(typeof value === "string" ? value.toUpperCase() : "");
  }, [value]);

  const emitChange = React.useCallback(
    (nextValue) => {
      if (typeof onChange === "function") {
        onChange(name, nextValue);
      }
    },
    [name, onChange]
  );

  const normalizedValue = normalizeHex(textValue || value) || "#000000";

  const handlePickerChange = (hexValue) => {
    const normalized = normalizeHex(hexValue) || "#000000";
    setTextValue(normalized);
    emitChange(normalized);
  };

  const handleTextChange = (event) => {
    const nextRaw = event.target.value.toUpperCase();
    setTextValue(nextRaw);
    emitChange(nextRaw);
  };

  const handleTextBlur = () => {
    const normalized = normalizeHex(textValue);
    if (!normalized) {
      return;
    }

    setTextValue(normalized);
    emitChange(normalized);
  };

  return (
    <Field.Root name={name} id={name} error={error} hint={hint} required={required}>
      <Flex direction="column" alignItems="stretch" gap={2}>
        <Field.Label action={labelAction}>{label}</Field.Label>
        <Box
          style={{
            opacity: disabled ? 0.6 : 1,
            pointerEvents: disabled ? "none" : "auto",
          }}
        >
          <Picker color={normalizedValue} onChange={handlePickerChange} />
        </Box>
        <Flex gap={2} alignItems="center">
          <Swatch $color={normalizedValue} />
          <Flex direction="column" alignItems="stretch" gap={1} style={{ width: "100%", maxWidth: "20rem" }}>
            <Typography variant="omega" textColor="neutral600" tag="label">
              HEX
            </Typography>
            <Field.Input
              ref={ref}
              value={textValue}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              placeholder="#000000"
              disabled={disabled}
            />
          </Flex>
        </Flex>
        <Field.Hint />
        <Field.Error />
      </Flex>
    </Field.Root>
  );
});
