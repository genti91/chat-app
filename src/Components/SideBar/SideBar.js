import React from "react";
import { v1 as uuid } from "uuid";
import style from './SideBar.module.css'

const SideBar = ({setRender}) => {
    function create() {
        setRender({create: false})
        // const id = uuid();
        // props.history.push(`/room/${id}`);
    }
    function chat() {
        setRender({create: true})
    }

    return (
        <div className={style.sideBar}>
            <button className={style.button} onClick={chat}>🔥-chat-on-fire</button>
            <button className={style.button} onClick={create}>🎮-La Cova Gamer</button>
            <div className={style.disMute}>
                <button className={style.button} onClick={create}>Disconnect</button>
                <button className={style.button} onClick={create}>Mute</button>
            </div>
        </div>
    );
};

export default SideBar;
