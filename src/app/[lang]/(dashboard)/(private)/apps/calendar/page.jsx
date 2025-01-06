import Card from '@mui/material/Card';
import CalendarWrapper from '@views/apps/calendar/CalendarWrapper';
import AppFullCalendar from '@/libs/styles/AppFullCalendar';

const CalendarApp = () => {
  return (
    <Card className='overflow-visible'>
      <AppFullCalendar className='app-calendar'>
        <CalendarWrapper />
      </AppFullCalendar>
    </Card>
  )
}

export default CalendarApp
