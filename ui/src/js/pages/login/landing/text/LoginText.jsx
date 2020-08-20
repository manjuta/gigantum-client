// @flow
// vendor
import React from 'react';
// css
import './LoginText.scss';

const LoginText = () => (
  <section className="LoginText flex flex--column justify--space-around">
    <h4 className="Login--ternary text-center">Sign up or Log In</h4>
    <p>Sign up or Log in to start using Gigantum Client locally.</p>
    <p>
      By logging in to Gigantum Hub you can easily sync up to 5GB of data for free, share your work with others, and
      <a href="#">more</a>
      .
    </p>
    <p>Once you log in, you’ll be able to work offline.</p>
    <p>
      Learn more about
      {' '}
      <a href="#">user accounts here</a>
      .
    </p>
  </section>
);

export default LoginText;
