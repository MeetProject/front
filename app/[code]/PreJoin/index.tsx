import Device from './Device';
import Footer from './Footer';
import Header from './Header';

export default function PreJoin() {
  return (
    <div className='flex h-svh w-svw flex-col'>
      <Header />
      <div className='flex flex-1 items-center justify-center'>
        <div className='flex w-full items-center justify-center [@media(max-width:1000px)]:flex-col'>
          <Device />
          {/* <div className='m-4 ml-2 h-135 w-md shrink-0 border'>nameform</div> */}
        </div>
      </div>
      <Footer />
    </div>
  );
}
