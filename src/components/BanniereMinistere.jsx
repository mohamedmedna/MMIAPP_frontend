import React from 'react';
import banniere from '../assets/banniere-ministere.jpg';
import '../components/BanniereMinistere.css';
const BanniereMinistere = () => (
  <section className="banniere-ministere">
    <img src={banniere} alt="Bannière Ministère" className="banniere-img" />
  </section>
);

export default BanniereMinistere;
