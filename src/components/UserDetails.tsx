import TelegramUser from "@/models/TelegramUser";

interface UserDetailsProps {
    user: TelegramUser
}

function UserDetails({user} : UserDetailsProps) {

    return (<div>
        {user && (
            <div className="flex items-center space-x-4">
                <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                />
                <span className="text-lg font-bold text-red-500">{user.name}</span>
            </div>
        )}
    </div>);
}

export default UserDetails;