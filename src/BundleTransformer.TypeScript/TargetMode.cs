﻿using System;

namespace BundleTransformer.TypeScript
{
	/// <summary>
	/// Target mode
	/// </summary>
	public enum TargetMode
	{
		[Obsolete]
		EcmaScript3 = 0,
		EcmaScript5 = 1,
		EcmaScript6 = 2,
		EcmaScript2015 = 2,
		EcmaScript2016 = 3,
		EcmaScript2017 = 4,
		EcmaScript2018 = 5,
		EcmaScript2019 = 6,
		EcmaScript2020 = 7,
		EcmaScript2021 = 8,
		EcmaScript2022 = 9,
		EcmaScript2023 = 10,
		EcmaScript2024 = 11,
		EcmaScriptNext = 99
	}
}