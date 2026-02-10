import { useEffect, useState } from "react";
import { getDestinos } from "../services/api";
import TarjetaDestino from "../components/TarjetaDestino";

function Destinos() {
    const [destinos, setDestinos] = useState([]);

    useEffect(() => {
        getDestinos().then(setDestinos);
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h2>Destinos turísticos</h2>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {destinos.map((d) => (
                    <TarjetaDestino key={d.id} destino={d} />
                ))}
            </div>
        </div>
    );
}

export default Destinos;
