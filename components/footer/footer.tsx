import { signOut } from 'next-auth/react';
import Button from '../button/button';
import styles from './footer.module.css';

function Footer() {
  return (
    <>
      <br />
      <br />
      <footer className={styles.footerContainer}>
        <Button onClickAction={() => signOut()} isGenerating={false}>
          sign out
        </Button>
      </footer>
    </>
  );
}

export default Footer;
