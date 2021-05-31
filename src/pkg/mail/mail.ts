import { format as fmt } from "util";
import Mail from "@sendgrid/mail";
import { ResponseError } from "@sendgrid/helpers/classes";
import { EmailData } from "@sendgrid/helpers/classes/email-address";
import { config } from "../config";

export type SendInviteOptions = {
  sendTo: EmailData;
  siteId: string;
  url: string;
};

export interface IMailService {
  sendInvite(options: SendInviteOptions): void;
}

class EmailService implements IMailService {
  sendInvite(opts: SendInviteOptions): void {
    const inviteText = fmt(
      'Welcome!\n\nYou got invite from "%s"\nConfirm Your Email %s',
      opts.siteId,
      opts.url
    );

    const data: Mail.MailDataRequired = {
      to: opts.sendTo,
      from: config.MAIL_NOREPLY,
      subject: fmt("Invitation: You got invited to %s account", opts.siteId),
      text: inviteText,
    };

    Mail.send(data).catch(this.errorHandler);
  }

  private errorHandler(error: ResponseError) {
    console.log(JSON.stringify(error, null, 2));
  }
}

export function initMailService(): EmailService {
  Mail.setApiKey(config.MAIL_APIKEY);

  return new EmailService();
}
