import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import LogoFruver from './assets/logo.png'; // Importa el logo
import Swal from 'sweetalert2';
import 'font-awesome/css/font-awesome.min.css';

const Lote = () => {
  const [productos, setProductos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [formData, setFormData] = useState({
    idproducto: '',
    fechaEnt: new Date(),
    idestados: '',  // Este campo no es necesario en el frontend ya que lo genera el backend
    cantidad: 0,
    fechaCad: new Date(),
    proveedor: '',
  });

  useEffect(() => {
    // Obtener productos y estados desde el backend
    axios.get('http://localhost:5000/productos')
      .then(response => setProductos(response.data))
      .catch(error => console.error(error));

    axios.get('http://localhost:5000/estados')
      .then(response => setEstados(response.data))
      .catch(error => console.error(error));

    // Obtener lotes existentes
    axios.get('http://localhost:5000/lotes')
      .then(response => setLotes(response.data))
      .catch(error => console.error(error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date, name) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  // Función para verificar si la fecha de caducidad está vencida
  const verificarVencimiento = (fechaCad) => {
    const fechaActual = new Date();
    if (new Date(fechaCad) < fechaActual) {
      Swal.fire({
        icon: 'error',
        title: '¡Fecha Vencida!',
        text: 'No se puede agregar un lote con fecha de caducidad vencida.',
      });
      return true; // Indica que la fecha está vencida
    }
    return false; // La fecha no está vencida
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Convertir fechas a formato adecuado para MySQL
    const fechaEntFormatted = formData.fechaEnt.toISOString().split('T')[0];
    const fechaCadFormatted = formData.fechaCad.toISOString().split('T')[0];

    // Verificar si la fecha de caducidad está vencida
    if (verificarVencimiento(fechaCadFormatted)) {
      return; // Si la fecha está vencida, no proceder con el envío
    }

    const loteData = {
      ...formData,
      fechaEnt: fechaEntFormatted,
      fechaCad: fechaCadFormatted,
      idestados: '', // El estado será determinado por el backend
    };
    
    axios.post('http://localhost:5000/lote', loteData)
      .then(response => {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Lote agregado correctamente',
        });
  
        // Actualizar la lista de lotes después de agregar uno nuevo
        axios.get('http://localhost:5000/lotes')
          .then(response => setLotes(response.data))
          .catch(error => console.error(error));
      })
      .catch(error => {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al agregar el lote',
        });
      });
  };

  const handleDelete = (idlote) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción eliminará el lote permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/lote/${idlote}`)
          .then(response => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'El lote ha sido eliminado correctamente.',
            });
            // Actualizar la lista de lotes después de la eliminación
            axios.get('http://localhost:5000/lotes')
              .then(response => setLotes(response.data))
              .catch(error => console.error(error));
          })
          .catch(error => {
            console.error(error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un problema al eliminar el lote.',
            });
          });
      }
    });
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark custom-navbar">
        <a className="navbar-brand" href="/">
          <img src={LogoFruver} alt="Logo" style={{ width: '80px', marginRight: '10px' }} />
        </a>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item active">
              <a className="nav-link" href="/">PRODUCTOS</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/productos">Productos</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/contacto">Contacto</a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="lote-container">
        <h1>Gestión de Lotes</h1>

        {/* Formulario para agregar lote */}
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Producto</label>
            <select name="idproducto" value={formData.idproducto} onChange={handleChange} className="input">
              <option value="">Seleccione un producto</option>
              {productos.map(producto => (
                <option key={producto.idproducto} value={producto.idproducto}>
                  {producto.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fecha de Entrada</label>
            <DatePicker 
              selected={formData.fechaEnt} 
              onChange={(date) => handleDateChange(date, 'fechaEnt')} 
              className="input"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div className="form-group">
            <label>Cantidad</label>
            <input 
              type="number" 
              name="cantidad" 
              value={formData.cantidad} 
              onChange={handleChange} 
              className="input"
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Fecha de Caducidad</label>
            <DatePicker 
              selected={formData.fechaCad} 
              onChange={(date) => handleDateChange(date, 'fechaCad')} 
              className="input"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div className="form-group">
            <label>Proveedor</label>
            <input 
              type="text" 
              name="proveedor" 
              value={formData.proveedor} 
              onChange={handleChange} 
              className="input"
            />
          </div>

          <button type="submit" className="submit-btn">Agregar Lote</button>
        </form>

        {/* Tabla de lotes existentes */}
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Fecha de Entrada</th>
              <th>Estado</th>
              <th>Cantidad</th>
              <th>Fecha de Caducidad</th>
              <th>Proveedor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lotes.map(lote => (
              <tr key={lote.idlote}>
                <td>{lote.producto}</td>
                <td>{lote.fechaEnt}</td>
                <td>
                  {lote.estado === 'Vencido' ? (
                    <span className="expired-warning">¡Vencido!</span>
                  ) : (
                    lote.estado
                  )}
                </td>
                <td>{lote.cantidad}</td>
                <td>{lote.fechaCad}</td>
                <td>{lote.proveedor}</td>
                <td>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(lote.idlote)} >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section about">
            <h3>Acerca de Fruver</h3>
            <p>
              Fruver es una empresa dedicada a la distribución de productos frescos de alta calidad.
              Nuestro compromiso es ofrecer lo mejor para nuestros clientes, garantizando siempre productos
              frescos y a precios competitivos.
            </p>
          </div>

          <div className="footer-section links">
            <h3>Enlaces Rápidos</h3>
            <ul>
              <li><a href="/productos">Productos</a></li>
              <li><a href="/contacto">Contacto</a></li>
              <li><a href="/politica-privacidad">Política de Privacidad</a></li>
              <li><a href="/terminos">Términos y Condiciones</a></li>
            </ul>
          </div>

          <div className="footer-section contact">
            <h3>Contacto</h3>
            <p>Dirección: Cr 33 # 110 24, floridablanca, santander</p>
            <p>Email: <a href="mailto:contacto@fruver.com">Elmana@fruver.com</a></p>
            <p>Tel: +57 301 698 1025</p>
            <div className="social-links">
              <a href="https://www.facebook.com/portaldefrutas/?locale=es_LA" target="_blank" rel="noopener noreferrer">
                <i className="fa fa-facebook"></i>
              </a>
            </div>
          </div>

          
        </div>

        <div className="footer-bottom">
          <p>© 2024 Elmana Fruver. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Lote;

