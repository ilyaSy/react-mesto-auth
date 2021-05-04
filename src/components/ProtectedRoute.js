import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import {CurrentUserContext} from '../contexts/CurrentUserContext';

export default function ProtectedRoute({component: Component, ...props}){
  const currentUser = React.useContext(CurrentUserContext);
  return (
  <Route>
    {currentUser ? <Component {...props} /> : <Redirect to="/sign-in"/>}
  </Route>
  )
}