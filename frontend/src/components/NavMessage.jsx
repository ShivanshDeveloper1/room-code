import React from 'react'
// import Message from '../images/pngwing.com (1).png';

function NavMessage() {
  return (
    <li className='nav-item dropdown'>
      <a className='nav-link nav-icon' href='#' data-bs-toggle="dropdown">
        <i className='bi bi-chat-left-text'></i>
        <span className='badge bg-success badge-number'>3</span>
      </a>

      <ul className='dropdown-menu dropdown-menu-end dropdown-menu=arrow messages'>
        <li className='dropdown-header'>
          You have 4 new notifications
          <a href='#'>
            <span className='badge rounded-pill bg-primary p-2 ms-2'>
              view all
            </span>
          </a>
        </li>
        <li>
          <hr className='dropdown-divider' />
        </li>
        <li className='message-item'>

          <a href='#'>
            <img src="" alt='' width={30} className='rounded-circle' />
            <div>
              <h4>Mr. abc</h4>
              <p>Meet me Tomorrow.</p>
              <p>4 hrs. ago</p>
            </div>
          </a>
        </li>
        <li>
          <hr className='dropdown-divider' />
        </li>
      </ul>
    </li>
  )
}

export default NavMessage
