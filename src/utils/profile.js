import axios from 'axios';
import { API_BASE_URL } from '../config';

export async function fetchActiveProfiles() {
  const res = await axios.get(`${API_BASE_URL}/profiles/active`);
  return res.data.response.data;
}


export function setActiveProfile(id, name) {
  localStorage.setItem('activeProfileId', id);
  localStorage.setItem('activeProfileName', name);
}


export function getActiveProfileId() {
  return localStorage.getItem('activeProfileId');
}

export function getActiveProfileName() {
  return localStorage.getItem('activeProfileName');
}
