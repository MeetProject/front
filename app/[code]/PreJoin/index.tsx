import Device from './Device';
import Footer from './Footer';
import Header from './Header';
import NameForm from './NameForm';

export default function PreJoin() {
  return (
    <div className='flex h-svh w-svw flex-col'>
      <Header />
      <div className='flex flex-1 items-center justify-center'>
        <div className='flex w-full items-center justify-center [@media(max-width:1000px)]:flex-col'>
          <Device />
          <div className='m-4 ml-2 flex w-md max-w-full shrink-0 flex-col items-center justify-center p-6 [@media(max-width:1000px)]:shrink'>
            <h1 className='text-1.5xl'>이름이 무엇인가요?</h1>
            <NameForm />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
