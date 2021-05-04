import React from 'react';
import Header from './Header';

export default function Loading(props){
  const text = props.text || 'Загрузка данных';
  return (
    <>
      <Header />
      <h1 className="content__title">{text}</h1>
    </>
  )
}