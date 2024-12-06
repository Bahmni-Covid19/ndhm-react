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
    const [loadingAbhaAddressSuggestions, setLoadingAbhaAddressSuggestions] = useState(false);
	const [abhaAddressSuggestions, setAbhaAddressSuggestions] = useState([]);

	useEffect(async () => {
        setLoadingAbhaAddressSuggestions(true);
		let response = await getAbhaAddressSuggestions();
		if (response.data !== undefined) {
            setLoadingAbhaAddressSuggestions(false);
			const fetchedOptions = response.data.abhaAddressList.map((item) => ({
				label: item,
				value: item,
			}));
			setAbhaAddressSuggestions(fetchedOptions);
		} else {
            setLoadingAbhaAddressSuggestions(false);
			console.error("An error occurred while getting suggestions");
		}
	}, []);

    const validateAbhaAddress = (newAbhaAddress) => {
        const MIN_LENGTH = 8;
        const MAX_LENGTH = 18;

        if (newAbhaAddress.length < MIN_LENGTH || newAbhaAddress.length > MAX_LENGTH) {
          return `ABHA Address must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`;
        }

        const abhaRegex = /^(?![._])(?!.*\..*\..*)(?!.*_.*_.*)[a-zA-Z0-9._]*(?<![._])$/;

        if (!abhaRegex.test(newAbhaAddress)) {
          return (
            <div>
              ABHA Address can only contain letters, numbers, a dot (.) or an underscore (_).
              <br />
              The dot (.) or underscore (_) must not be at the beginning or end and should not appear consecutively.
            </div>
          );
        }
        return null;
      };

	async function onCreate() {
		setError("");
		const validationError = validateAbhaAddress(newAbhaAddress);
        if (validationError) {
            setError(validationError);
        } else  {
			setLoader(true);
			var response = await createABHAAddress(newAbhaAddress);
			setLoader(false);
			if (response.error) {
				setError(response.error.message);
			} else {
				setNewAbhaAddress(newAbhaAddress.concat(cmSuffix));
				props.setABHAAddressCreated(true);
			}
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
                            loading={loadingAbhaAddressSuggestions}
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
                                        loadingAbhaAddressSuggestions
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

