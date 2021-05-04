import React from 'react';
import {Switch, Route, useHistory } from 'react-router-dom';
import Loading from './Loading';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import EditAvatarPopup from './EditAvatarPopup';
import EditProfilePopup from './EditProfilePopup';
import AddPlacePopup from './AddPlacePopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import ImagePopup from './ImagePopup';
import Register from './Register';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import api from '../utils/api';
import auth from '../utils/auth';

import {CurrentUserContext} from '../contexts/CurrentUserContext';

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
  const [сardToDelete, setCardToDelete] = React.useState(null);
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [cards, setCards] = React.useState([])
  const [textLoading, setTextLoading] = React.useState("Данные загружаются...");
  const [email, setEmail] = React.useState('');

  const history = useHistory();

  // React.useEffect(() => {
  //   Promise.all([api.getUserInfo(), api.getInitialCards()])
  //     .then(([userData, initialCards]) => {
  //       setCurrentUser(userData);
  //       setCards(initialCards)
  //     })
  //     .catch(err => {
  //       console.log('Ошибка: ' + err);
  //       setTextLoading('Ошибка при загрузке данных!');
  //     })
  // }, []);

  const loadData = () => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([userData, initialCards]) => {
        setCurrentUser(userData);
        setCards(initialCards)
        history.push('/');
      })
      .catch(err => {
        console.error('Ошибка: ' + err);
        setTextLoading('Ошибка при загрузке данных!');
      })
  }

  React.useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt){
      history.push("/");
      loadData();
    }
  }, [history]);

  //close on Escape button
  const closeByEscapeBtn = event => {
    if (event && event.key === 'Escape') {
      closeAllPopups();
    }
  }

  const handleEditAvatarClick = () => {
    document.addEventListener('keydown', closeByEscapeBtn);
    setIsEditAvatarPopupOpen(true);
  }

  const handleEditProfileClick = () => {
    document.addEventListener('keydown', closeByEscapeBtn);
    setIsEditProfilePopupOpen(true);
  }

  const handleAddPlaceClick = () => {
    document.addEventListener('keydown', closeByEscapeBtn);
    setIsAddPlacePopupOpen(true);
  }

  const handleDeleteClick = (card) => {
    document.addEventListener('keydown', closeByEscapeBtn);
    setCardToDelete(card);
  }

  const handleCardClick = (card) => {
    document.addEventListener('keydown', closeByEscapeBtn);
    setSelectedCard(card);
  }

  const closeAllPopups = () => {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setCardToDelete(null);
    setSelectedCard(null);
    document.removeEventListener('keydown', closeByEscapeBtn);
  }

  const handleUpdateUser = ({name, about}) => {
    api.editUserInfo({name, about})
      .then(userData => {setCurrentUser(userData)})
      .then(() => {closeAllPopups()})
      .catch(err => console.log('Ошибка: ' + err))
  }

  const handleUpdateAvatar = avatar => {
    api.setUserAvatar( avatar )
      .then(userData => {setCurrentUser(userData)})
      .then(() => {closeAllPopups()})
      .catch(err => console.log('Ошибка: ' + err))
  }

  const handleCardLike = card => {
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    
    api.toggleLikeCard(card._id, isLiked)
      .then(newCard => { setCards(cards => cards.map(c => c._id === card._id ? newCard : c)) })
      .catch(err => console.log('Ошибка: ' + err))
  }

  const handleCardDelete = () => {
    const card = сardToDelete;
    api.deleteCard(card._id)
      .then(() => { setCards(cards => cards.filter(c => c._id !== card._id)) })
      .then(() => {closeAllPopups()})
      .catch(err => console.log('Ошибка: ' + err))
  }

  const handleAddPlaceSubmit = card => {
    api.addCard(card)
      .then(newCard => {setCards([newCard, ...cards])})
      .then(() => {closeAllPopups()})
      .catch(err => console.log('Ошибка: ' + err))
  }

  const handleRegister = (userCredantials) => {
    auth.registerUser(userCredantials)
      .then(res => {
        if(res.data.email) {
          history.push('/sign-in');
        }
      })
      .catch(err => console.log('Ошибка: ' + err))
  }

  const handleLogin = (userCredantials) => {
    auth.loginUser(userCredantials)
      .then(res => {
        const jwt = res.token;
        if (jwt){
          setEmail(userCredantials.email);
          localStorage.setItem('jwt', jwt);
          loadData();
        }
      })
  }

  const handleSignOut = () => {
    setEmail('');
    localStorage.removeItem('jwt');
    history.push('/sign-in');
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <Header email={email} onSignOut={handleSignOut}/>

      <Switch>
        {/* {currentUser && cards ? */}
          <ProtectedRoute exact path="/"
            component={Main}
            cards={cards}
            onEditProfile={handleEditProfileClick} 
            onAddPlace={handleAddPlaceClick}
            onEditAvatar={handleEditAvatarClick}
            onCardClick={handleCardClick}
            onDeleteClick={handleDeleteClick}
            onCardLike={handleCardLike}
            onCardDelete={handleCardDelete}/>
          {/* : <Loading text={textLoading}/> */}
        {/* } */}

        <Route path="/sign-up">
          <Register onRegister={handleRegister}/>
        </Route>

        <Route path="/sign-in">
          <Login onLogin={handleLogin}/>
        </Route>

        <ProtectedRoute path="*" />
      </Switch>

      <Footer />

      {currentUser && cards &&
        <>
          <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser}/>
          <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar}/>
          <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit}/>
          <ConfirmDeletePopup isOpen={сardToDelete ? true : false} onClose={closeAllPopups} onDeletePlace={handleCardDelete}/>
        </>
      }

      <ImagePopup card={selectedCard} onClose={closeAllPopups}/>
    </CurrentUserContext.Provider>
  );
}

export default App;
