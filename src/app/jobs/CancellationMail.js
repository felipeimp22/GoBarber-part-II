import { format, parseISO } from 'date-fns';
import pt from '../../lib/Mail';
import Mail from '../../lib/Mail';

class CancelationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { appointment } = data;
    console.log('A fila executou');
    Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'scheduling canceled',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(
          parseISO(appointment.date),
          "'Day'dd '/' MMMM', at' H:mm'h'"
        ),
      },
    });
  }
}
export default new CancelationMail();
