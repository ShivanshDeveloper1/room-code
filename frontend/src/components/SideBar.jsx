import React, { useState } from "react";
import "./sidebar.css";

import { FaUsers } from "react-icons/fa";
import { RiBriefcase4Fill } from "react-icons/ri";
import { IoGridOutline } from "react-icons/io5";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { MdHistoryEdu } from "react-icons/md";
import { MdOutlineCategory } from "react-icons/md";
import { LuMessageCircleMore } from "react-icons/lu";
import { VscFeedback } from "react-icons/vsc";
import { GrUserAdmin } from "react-icons/gr";
import { FaGroupArrowsRotate } from "react-icons/fa6";

import { Link } from "react-router-dom";

const SideBar = () => {
  let role = "";

  const [dropdowns, setDropdowns] = useState({
    employees: false,
    admin:false,
    
  });

  const toggleDropdown = (name) => {
    setDropdowns({ ...dropdowns, [name]: !dropdowns[name] });
  };
  role = sessionStorage.getItem("userRole");
  console.log("role in sidebar",role);
  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav" id="sidebar-nav">
       
        {role === "SuperAdmin" && (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/super-admin-dashboard">
                <IoGridOutline size={20} />
                <span className="nav-heading collapsed">Super Admin Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admins">
                <GrUserAdmin size={20} />
                <span className="nav-heading collapsed">Admins</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/users">
                <FaUsers size={20} />
                <span className="nav-heading collapsed">Users</span>
              </Link>
            </li>



 {/* <li className="nav-item">
              <div
                className="nav-link"
                onClick={() => toggleDropdown("user")}
              >
                <FaUsers size={20} />
                <span className="nav-heading collapsed">User</span>
              </div>
              {dropdowns.user && (
                <ul className="nav-content">
                  <li className="ps-3">
                    <Link to="/user-register" className="nav-link">
                      <i className="bi bi-circle"></i>
                      <span className="nav-heading collapsed">
                        Add User
                      </span>
                    </Link>
                  </li>
                  <li className="ps-3">
                    <Link to="/user-list" className="nav-link">
                      <i className="bi bi-circle"></i>
                      <span className="nav-heading collapsed">
                        User List
                      </span>
                    </Link>
                  </li>
                </ul>
              )}
            </li> */}
            <li className="nav-item">
              <Link className="nav-link" to="/assign-group">
                <FaGroupArrowsRotate size={20} />
                <span className="nav-heading collapsed">Assing Group</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/all-group">
                <LuMessageCircleMore  size={20} />
                <span className="nav-heading collapsed">Room</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/feedbacks">
                <VscFeedback  size={20} />
                <span className="nav-heading collapsed">Feedbacks</span>
              </Link>
            </li>
           
          </>
        )}

        {role === "Admin" && (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/admin-dashboard">
                <IoGridOutline size={20} />
                <span className="nav-heading collapsed">
                  Admin Dashboard
                </span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/create-group">
                <FaGroupArrowsRotate size={20} />
                <span className="nav-heading collapsed">
                  Create Group
                </span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/my-groups">
                <LuMessageCircleMore size={20} />
                <span className="nav-heading collapsed">
                  Message
                </span>
              </Link>
            </li>
           
          </>
        )}
        {role === "User" && (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/user-dashboard">
                <IoGridOutline size={20} />
                <span className="nav-heading collapsed">
                  User Dashboard
                </span>
              </Link>
            </li>
         
            <li className="nav-item">
              <Link className="nav-link" to="/user-group">
                <LuMessageCircleMore size={20} />
                <span className="nav-heading collapsed">
                  Rooms
                </span>
              </Link>
            </li>
           
          </>
        )}
      </ul>
    </aside>
  );
};

export default SideBar;
