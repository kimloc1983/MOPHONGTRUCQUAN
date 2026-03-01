/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import IntegerSimulation from './components/simulations/IntegerSimulation';
import RotationalSimulation from './components/simulations/RotationalSimulation';
import ReflectionalSimulation from './components/simulations/ReflectionalSimulation';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/learn/integer" element={<IntegerSimulation />} />
            <Route path="/learn/rotational" element={<RotationalSimulation />} />
            <Route path="/learn/reflectional" element={<ReflectionalSimulation />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
