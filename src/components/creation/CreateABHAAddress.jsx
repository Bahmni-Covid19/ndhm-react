import React, { useState, useEffect } from "react";
import "./creation.scss";
import Spinner from "../spinner/spinner";
import {
	createABHAAddress,
	getAbhaAddressSuggestions,
} from "../../api/hipServiceApi";
import Footer from "./Footer";
import { cmSuffixProperty } from "../../api/constants";
import { Autocomplete, TextField, InputAdornment } from "@mui/material";

const CreateABHAAddress = (props) => {
	const [loader, setLoader] = useState(false);
	const [error, setError] = useState("");
	const [newAbhaAddress, setNewAbhaAddress] = [
		props.newAbhaAddress,
		props.setNewAbhaAddress,
	];
	const cmSuffix = localStorage.getItem(cmSuffixProperty);
    const [lodingAbhaAddressSuggestions, setLodingAbhaAddressSuggestions] = useState(false);
	const [abhaAddressSuggestions, setAbhaAddressSuggestions] = useState([]);

	useEffect(async () => {
		setLodingAbhaAddressSuggestions(true);
		let response = await getAbhaAddressSuggestions();
		if (response.data !== undefined) {
			setLodingAbhaAddressSuggestions(false);
			const fetchedOptions = response.data.abhaAddressList.map((item) => ({
				label: item,
				value: item,
			}));
			setAbhaAddressSuggestions(fetchedOptions);
		} else {
			setLodingAbhaAddressSuggestions(false);
			console.error("An error occurred while getting suggestions");
		}
	}, []);

	async function onCreate() {
		setError("");
		if (newAbhaAddress === "") {
			setError("ABHA Address cannot be empty");
		} else if (newAbhaAddress.length > 3) {
			setLoader(true);
			var response = await createABHAAddress(newAbhaAddress);
			setLoader(false);
			if (response.error) {
				setError(response.error.message);
			} else {
				setNewAbhaAddress(newAbhaAddress.concat(cmSuffix));
				props.setABHAAddressCreated(true);
			}
		} else {
			setError("ABHA Address should have minimum of 4 characters");
		}
	}

	return (
		<div>
			<div className="abha-address">
				<label htmlFor="abhaAdddress">Enter custom ABHA Address or Select from suggestions </label>
				<div className="abha-adddress-input">
					<div>
						<Autocomplete
							id="free-solo-demo"
							freeSolo
							options={abhaAddressSuggestions.map((option) => option.label)}
							loading={lodingAbhaAddressSuggestions}
							inputValue={newAbhaAddress}
							onInputChange={(event, value) => setNewAbhaAddress(value)}
							renderInput={(params) => (
								<TextField
									{...params}
									id="abha-address-input"
									label="ABHA Address"
									InputProps={{
										...params.InputProps,
										endAdornment: (
											<InputAdornment position="end">{cmSuffix}</InputAdornment>
										),
									}}
									noOptionsText={
										lodingAbhaAddressSuggestions
											? "Getting suggestions..."
											: "No suggestions"
									}
								/>
							)}
						/>
					</div>
				</div>
			</div>
			<div className="center" style={{ paddingTop: "20px" }}>
				<button
					type="button"
					className="proceed"
					disabled={newAbhaAddress === ""}
					onClick={onCreate}
				>
					Create
				</button>
			</div>
			{loader && <Spinner />}
			{error !== "" && <h6 className="error">{error}</h6>}
			<Footer setBack={props.setBack} />
		</div>
	);
};

export default CreateABHAAddress;
