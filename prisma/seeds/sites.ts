export const sites = [
  {
    display_name: "demo",
    alias: "demo",
    users: {
      create: {
        username: "john.doe",
        email: "john.doe@demo.net",
        first_name: "john",
        last_name: "doe",
      },
    },
    clients: {
      create: {
        client_id: "id0",
        client_secret: "secrret0",
        callback: "http://demo.example.net/oauth/default/callback",
      },
    },
  },
  {
    display_name: "acme",
    alias: "acme",
    invites: {
      create: {
        code: "acme-01",
        email: "john.doe@acme.com",
        invite_uri: "http://acme.example.net/invite/acme-01",
        active: true,
        expire_at: new Date(),
      },
    },
  },
];
