import { Site, Invite } from "@prisma/client";
import async from "async";
import { format as fmt } from "util";
import Mail from "@sendgrid/mail";
import { config } from "../../config";

Mail.setApiKey(config.MAIL_APIKEY);

type WorkerArgs<Type> = {
  [Property in keyof Type]: Type[Property];
};

type WorkerAction = (queue: async.QueueObject<InviteMailParams>) => void;

interface WorkerDispatch {
  (action: WorkerAction): void;
}

type InviteMailArgs = WorkerArgs<InviteMailParams>;
type InviteMailDispatch = WorkerDispatch;

type InviteMailParams = {
  site: Site;
  invite: Invite;
};

export function InviteMailDispatch(): WorkerDispatch {
  const queue = async.queue<InviteMailParams>(InviteMailHandler, 1);
  return (action) => action(queue);
}

const InviteMailHandler = async (
  params: InviteMailParams,
  callback: () => void
) => {
  console.log(
    fmt(
      "worker.mail.invite %s",
      params.site.alias,
      params.invite.email,
      params.invite.invite_uri
    )
  );
  const inviteText = fmt(
    'Welcome!\n\nYou got invite from "%s"\nConfirm Your Email %s',
    params.site.alias,
    params.invite.invite_uri
  );

  const data: Mail.MailDataRequired = {
    to: params.invite.email,
    from: config.MAIL_NOREPLY,
    subject: fmt(
      "Invitation: You got invited to %s account",
      params.site.alias
    ),
    text: inviteText,
  };

  return Mail.send(data).then(callback).catch(callback);
};

export const send_invite = (params: InviteMailArgs): WorkerAction => {
  return (queue): void => {
    queue.push(params);
  };
};
