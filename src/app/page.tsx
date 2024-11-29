"use client";

import UserDetails from "@/components/UserDetails";
import {useEffect, useState} from "react";
import TelegramUser from "@/models/TelegramUser";
import {cloudStorage, init, retrieveLaunchParams} from "@telegram-apps/sdk";
import GameCanvas from "@/components/GameCanvas";

const saveUserScore = async (score) => {
    await cloudStorage.setItem("score", score);
}

function Home() {

    // User info from Telegram
    const [user, setUser] = useState<TelegramUser>(null);

    // Telegram Web Apps API Initialization
    useEffect(() => {
        /*init();
        const userInfo = retrieveLaunchParams().initData.user;

        if (userInfo) {
            setUser({
                id: userInfo.id,
                name: `${userInfo.firstName} ${userInfo.lastName || ""}`.trim(),
                photoUrl: userInfo.photoUrl
            });
        }*/


    }, []);


    return (
        <div>
            {user && <UserDetails user={user}></UserDetails>}
            <GameCanvas></GameCanvas>
        </div>
    );
}

export default Home;