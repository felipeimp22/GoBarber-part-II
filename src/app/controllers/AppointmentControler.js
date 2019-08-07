import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'date', 'user_id', 'past', 'cancelable'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'id'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails' });
    }
    const { provider_id, date } = req.body;
    // check if has provider
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });
    if (!isProvider) {
      return res
        .status(400)
        .json({ error: 'create appointments only with providers' });
    }
    /**
     * check if it's past dates
     */
    const hourStart = startOfHour(parseISO(date));
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past day is not allowed' });
    }
    /**
     * check date available
     */
    const checkAvailable = await Appointment.findOne({
      where: { provider_id, canceled_at: null, date: hourStart },
    });
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });
    if (req.userId === provider_id) {
      return res.status(400).json({
        error: 'the same people is not to be able to apli appointments',
      });
    }

    if (checkAvailable) {
      return res
        .status(400)
        .json({ error: 'appointment date is not available' });
    }
    /**
     * Notify providers
     */
    const user = await User.findByPk(req.userId);
    const formatDay = format(
      hourStart,
      "'Day'dd '/' MMMM', at' H:mm'h'"
      // ,{locale: pt}      <---to translate to portuguese
    );
    await Notification.create({
      content: `new scheduling of ${user.name} to  ${formatDay}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });
    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: 'you dont have permission',
      });
    }
    const dateWithSub = subHours(appointment.date, 2);
    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error:
          'you cant cancel the appointmente after during 2 hours remaining',
      });
    }

    appointment.canceled_at = new Date();
    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}
export default new AppointmentController();

/* .then(() => {
  console.log('ok');
})
.catch(err => {
  throw new Error(err);
}); */
