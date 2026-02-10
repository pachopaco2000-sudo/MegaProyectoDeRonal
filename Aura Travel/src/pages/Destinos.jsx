import { useEffect, useState } from "react";
import { getDestinos } from "../services/api";

function Destinos() {
    const [destinos, setDestinos] = useState([]);

    useEffect(() => {
        getDestinos().then(setDestinos);
    }, []);

    return (
        <div>
            <h2>Destinos turísticos</h2>
            <ul>
                {destinos.map((d) => (
                    <li key={d.id}>
                        <strong>{d.nombre}</strong> - {d.descripcion}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Destinos;
