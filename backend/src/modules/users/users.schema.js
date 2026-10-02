const updateProfileSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    properties: {
      name: {
        type: "string",
        minLength: 1,
        maxLength: 100,
      },
    },
  },
};

const changePasswordSchema = {
  body: {
    type: "object",
    required: ["currentPassword", "newPassword"],
    additionalProperties: false,
    properties: {
      currentPassword: {
        type: "string",
        minLength: 1,
        maxLength: 128,
      },
      newPassword: {
        type: "string",
        minLength: 8,
        maxLength: 128,
      },
    },
  },
};

export { updateProfileSchema };
export { changePasswordSchema };