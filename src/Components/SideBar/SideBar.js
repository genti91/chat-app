import React from "react";
import { v1 as uuid } from "uuid";
import style from './SideBar.module.css'

const SideBar = ({setRender}) => {
    function create() {
        setRender({create: false})
        // const id = uuid();
        // props.history.push(`/room/${id}`);
    }

    return (
        <div className={style.sideBar}>
            <button className={style.button} onClick={create}>🎮-La Cova Gamer</button>
        </div>
    );
};

export default SideBar;
