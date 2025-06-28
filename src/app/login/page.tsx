"use client";

import React, { useState, useEffect } from 'react';
import { auth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  FormWrapper,
  StyledForm,
  FormTitle,
  FormGroup,
  StyledLabel,
  StyledInput,
  StyledButton,
  BackToHomeLink,
} from '@/components/Form.styles';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (auth.currentUser) {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (error) {
      if (error instanceof Error) {
        alert('Login mislukt: ' + error.message);
      } else {
        alert('Login mislukt: Onbekende fout');
      }
    }
  };

  return (
    <FormWrapper>
      <FormTitle>Inloggen</FormTitle>
      <StyledForm onSubmit={handleLogin}>
        <FormGroup>
          <StyledLabel htmlFor="email">E-mail</StyledLabel>
          <StyledInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
          <StyledLabel htmlFor="password">Wachtwoord</StyledLabel>
          <StyledInput
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormGroup>
        <StyledButton type="submit">Login</StyledButton>
      </StyledForm>
      <BackToHomeLink href="/">Terug naar tijdlijn</BackToHomeLink>
    </FormWrapper>
  );
};

export default LoginPage;
