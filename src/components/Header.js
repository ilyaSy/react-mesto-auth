import React from 'react';
import {useLocation, Link} from 'react-router-dom';
import logo from '../images/logo.svg';

export default function Header(props){
  const location = useLocation();

  return (
    <header className="header">
      <img src={logo} alt="Логотип: Mesto Russia" className="header__logo" />
      <div className="header__login">
        {props.email && <p className="header__login_email">{props.email}</p>}
        {
          location.pathname === '/sign-in' &&
          (<Link to='/sign-up' className="header__login_link">Регистрация</Link>)
        }
        {
          location.pathname === '/sign-up' &&
          (<Link to='/sign-in' className="header__login_link">Войти</Link>)
        }
        {
          location.pathname === '/' &&
          (<p to='/sign-out' className="header__login_link" onClick={props.onSignOut}>Выйти</p>)
        }
      </div>
    </header>
  )
}