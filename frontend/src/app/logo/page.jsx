
import React from 'react';
import Link from 'next/link';

export default function Logo() {
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" width="160" height="40" fill="none">
  <g transform="translate(4, 4)">
    <circle cx="16" cy="16" r="15" fill="#FF5A5F" fill-opacity="0.1" stroke="#FF5A5F" strokeWidth="2"/>
    <path d="M16 6 L23 11 L23 21 L16 26 L9 21 L9 11 Z" stroke="#FF5A5F" strokeWidth="2.2" strokeLinejoin="round" fill="none"/>
    <circle cx="16" cy="16" r="3.2" fill="#FF5A5F"/>
    <path d="M16 9.5 L16 12.5 M16 19.5 L16 22.5 M10.5 13 L13 14.5 M19 17.5 L21.5 19 M21.5 13 L19 14.5 M13 17.5 L10.5 19" stroke="#FF5A5F" strokeWidth="1.5" strokeLinecap="round"/>
  </g>
  <text x="44" y="26" font-family="Plus Jakarta Sans, Inter, sans-serif" font-size="20" font-weight="800" fill="#222222" letter-spacing="-0.5px">Agent<tspan fill="#FF5A5F">Proof</tspan></text>
</svg>
    </>
  );
}
